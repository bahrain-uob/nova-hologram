"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovaSonicBidirectionalStreamClient = exports.StreamSession = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const node_http_handler_1 = require("@smithy/node-http-handler");
const node_crypto_1 = require("node:crypto");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const rxjs_2 = require("rxjs");
const consts_1 = require("./consts");
class StreamSession {
    constructor(sessionId, client) {
        this.sessionId = sessionId;
        this.client = client;
        this.audioBufferQueue = [];
        this.maxQueueSize = 200; // Maximum number of audio chunks to queue
        this.isProcessingAudio = false;
        this.isActive = true;
    }
    // Register event handlers for this specific session
    onEvent(eventType, handler) {
        this.client.registerEventHandler(this.sessionId, eventType, handler);
        return this; // For chaining
    }
    async setupPromptStart() {
        this.client.setupPromptStartEvent(this.sessionId);
    }
    async setupSystemPrompt(textConfig = consts_1.DefaultTextConfiguration, systemPromptContent = consts_1.DefaultSystemPrompt) {
        this.client.setupSystemPromptEvent(this.sessionId, textConfig, systemPromptContent);
    }
    async setupStartAudio(audioConfig = consts_1.DefaultAudioInputConfiguration) {
        this.client.setupStartAudioEvent(this.sessionId, audioConfig);
    }
    // Stream audio for this session
    async streamAudio(audioData) {
        // Check queue size to avoid memory issues
        if (this.audioBufferQueue.length >= this.maxQueueSize) {
            // Queue is full, drop oldest chunk
            this.audioBufferQueue.shift();
            console.log("Audio queue full, dropping oldest chunk");
        }
        // Queue the audio chunk for streaming
        this.audioBufferQueue.push(audioData);
        this.processAudioQueue();
    }
    // Process audio queue for continuous streaming
    async processAudioQueue() {
        if (this.isProcessingAudio || this.audioBufferQueue.length === 0 || !this.isActive)
            return;
        this.isProcessingAudio = true;
        try {
            // Process all chunks in the queue, up to a reasonable limit
            let processedChunks = 0;
            const maxChunksPerBatch = 5; // Process max 5 chunks at a time to avoid overload
            while (this.audioBufferQueue.length > 0 && processedChunks < maxChunksPerBatch && this.isActive) {
                const audioChunk = this.audioBufferQueue.shift();
                if (audioChunk) {
                    await this.client.streamAudioChunk(this.sessionId, audioChunk);
                    processedChunks++;
                }
            }
        }
        finally {
            this.isProcessingAudio = false;
            // If there are still items in the queue, schedule the next processing using setTimeout
            if (this.audioBufferQueue.length > 0 && this.isActive) {
                setTimeout(() => this.processAudioQueue(), 0);
            }
        }
    }
    // Get session ID
    getSessionId() {
        return this.sessionId;
    }
    async endAudioContent() {
        if (!this.isActive)
            return;
        await this.client.sendContentEnd(this.sessionId);
    }
    async endPrompt() {
        if (!this.isActive)
            return;
        await this.client.sendPromptEnd(this.sessionId);
    }
    async close() {
        if (!this.isActive)
            return;
        this.isActive = false;
        this.audioBufferQueue = []; // Clear any pending audio
        await this.client.sendSessionEnd(this.sessionId);
        console.log(`Session ${this.sessionId} close completed`);
    }
}
exports.StreamSession = StreamSession;
class NovaSonicBidirectionalStreamClient {
    constructor(config) {
        this.activeSessions = new Map();
        this.sessionLastActivity = new Map();
        this.sessionCleanupInProgress = new Set();
        const nodeHttp2Handler = new node_http_handler_1.NodeHttp2Handler({
            requestTimeout: 300000,
            sessionTimeout: 300000,
            disableConcurrentStreams: false,
            maxConcurrentStreams: 20,
            ...config.requestHandlerConfig,
        });
        if (!config.clientConfig.credentials) {
            throw new Error("No credentials provided");
        }
        this.bedrockRuntimeClient = new client_bedrock_runtime_1.BedrockRuntimeClient({
            ...config.clientConfig,
            credentials: config.clientConfig.credentials,
            region: config.clientConfig.region || "us-east-1",
            requestHandler: nodeHttp2Handler
        });
        this.inferenceConfig = config.inferenceConfig ?? {
            maxTokens: 1024,
            topP: 0.9,
            temperature: 0.7,
        };
    }
    isSessionActive(sessionId) {
        const session = this.activeSessions.get(sessionId);
        return !!session && session.isActive;
    }
    getActiveSessions() {
        return Array.from(this.activeSessions.keys());
    }
    getLastActivityTime(sessionId) {
        return this.sessionLastActivity.get(sessionId) || 0;
    }
    updateSessionActivity(sessionId) {
        this.sessionLastActivity.set(sessionId, Date.now());
    }
    isCleanupInProgress(sessionId) {
        return this.sessionCleanupInProgress.has(sessionId);
    }
    // Create a new streaming session
    createStreamSession(sessionId = (0, node_crypto_1.randomUUID)(), config) {
        if (this.activeSessions.has(sessionId)) {
            throw new Error(`Stream session with ID ${sessionId} already exists`);
        }
        const session = {
            queue: [],
            queueSignal: new rxjs_1.Subject(),
            closeSignal: new rxjs_1.Subject(),
            responseSubject: new rxjs_1.Subject(),
            toolUseContent: null,
            toolUseId: "",
            toolName: "",
            responseHandlers: new Map(),
            promptName: (0, node_crypto_1.randomUUID)(),
            inferenceConfig: config?.inferenceConfig ?? this.inferenceConfig,
            isActive: true,
            isPromptStartSent: false,
            isAudioContentStartSent: false,
            audioContentId: (0, node_crypto_1.randomUUID)()
        };
        this.activeSessions.set(sessionId, session);
        return new StreamSession(sessionId, this);
    }
    async processToolUse(toolName, toolUseContent) {
        const tool = toolName.toLowerCase();
        switch (tool) {
            case "getdateandtimetool":
                const date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
                const pstDate = new Date(date);
                return {
                    date: pstDate.toISOString().split('T')[0],
                    year: pstDate.getFullYear(),
                    month: pstDate.getMonth() + 1,
                    day: pstDate.getDate(),
                    dayOfWeek: pstDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
                    timezone: "PST",
                    formattedTime: pstDate.toLocaleTimeString('en-US', {
                        hour12: true,
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
            case "getweathertool":
                console.log(`weather tool`);
                const parsedContent = await this.parseToolUseContentForWeather(toolUseContent);
                console.log("parsed content");
                if (!parsedContent) {
                    throw new Error('parsedContent is undefined');
                }
                return this.fetchWeatherData(parsedContent?.latitude, parsedContent?.longitude);
            default:
                console.log(`Tool ${tool} not supported`);
                throw new Error(`Tool ${tool} not supported`);
        }
    }
    async parseToolUseContentForWeather(toolUseContent) {
        try {
            // Check if the content field exists and is a string
            if (toolUseContent && typeof toolUseContent.content === 'string') {
                // Parse the JSON string into an object
                const parsedContent = JSON.parse(toolUseContent.content);
                console.log(`parsedContent ${parsedContent}`);
                // Return the parsed content
                return {
                    latitude: parsedContent.latitude,
                    longitude: parsedContent.longitude
                };
            }
            return null;
        }
        catch (error) {
            console.error("Failed to parse tool use content:", error);
            return null;
        }
    }
    async fetchWeatherData(latitude, longitude) {
        const ipv4Agent = new https_1.default.Agent({ family: 4 });
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        try {
            const response = await axios_1.default.get(url, {
                httpsAgent: ipv4Agent,
                timeout: 5000,
                headers: {
                    'User-Agent': 'MyApp/1.0',
                    'Accept': 'application/json'
                }
            });
            const weatherData = response.data;
            console.log("weatherData:", weatherData);
            return {
                weather_data: weatherData
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error(`Error fetching weather data: ${error.message}`, error);
            }
            else {
                console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)} `, error);
            }
            throw error;
        }
    }
    // Stream audio for a specific session
    async initiateSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Stream session ${sessionId} not found`);
        }
        try {
            // Set up initial events for this session
            this.setupSessionStartEvent(sessionId);
            // Create the bidirectional stream with session-specific async iterator
            const asyncIterable = this.createSessionAsyncIterable(sessionId);
            console.log(`Starting bidirectional stream for session ${sessionId}...`);
            const response = await this.bedrockRuntimeClient.send(new client_bedrock_runtime_1.InvokeModelWithBidirectionalStreamCommand({
                modelId: "amazon.nova-sonic-v1:0",
                body: asyncIterable,
            }));
            console.log(`Stream established for session ${sessionId}, processing responses...`);
            // Process responses for this session
            await this.processResponseStream(sessionId, response);
        }
        catch (error) {
            console.error(`Error in session ${sessionId}: `, error);
            this.dispatchEventForSession(sessionId, 'error', {
                source: 'bidirectionalStream',
                error
            });
            // Make sure to clean up if there's an error
            if (session.isActive) {
                this.closeSession(sessionId);
            }
        }
    }
    // Dispatch events to handlers for a specific session
    dispatchEventForSession(sessionId, eventType, data) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        const handler = session.responseHandlers.get(eventType);
        if (handler) {
            try {
                handler(data);
            }
            catch (e) {
                console.error(`Error in ${eventType} handler for session ${sessionId}: `, e);
            }
        }
        // Also dispatch to "any" handlers
        const anyHandler = session.responseHandlers.get('any');
        if (anyHandler) {
            try {
                anyHandler({ type: eventType, data });
            }
            catch (e) {
                console.error(`Error in 'any' handler for session ${sessionId}: `, e);
            }
        }
    }
    createSessionAsyncIterable(sessionId) {
        if (!this.isSessionActive(sessionId)) {
            console.log(`Cannot create async iterable: Session ${sessionId} not active`);
            return {
                [Symbol.asyncIterator]: () => ({
                    next: async () => ({ value: undefined, done: true })
                })
            };
        }
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Cannot create async iterable: Session ${sessionId} not found`);
        }
        let eventCount = 0;
        return {
            [Symbol.asyncIterator]: () => {
                console.log(`AsyncIterable iterator requested for session ${sessionId}`);
                return {
                    next: async () => {
                        try {
                            // Check if session is still active
                            if (!session.isActive || !this.activeSessions.has(sessionId)) {
                                console.log(`Iterator closing for session ${sessionId}, done = true`);
                                return { value: undefined, done: true };
                            }
                            // Wait for items in the queue or close signal
                            if (session.queue.length === 0) {
                                try {
                                    await Promise.race([
                                        (0, rxjs_2.firstValueFrom)(session.queueSignal.pipe((0, operators_1.take)(1))),
                                        (0, rxjs_2.firstValueFrom)(session.closeSignal.pipe((0, operators_1.take)(1))).then(() => {
                                            throw new Error("Stream closed");
                                        })
                                    ]);
                                }
                                catch (error) {
                                    if (error instanceof Error) {
                                        if (error.message === "Stream closed" || !session.isActive) {
                                            // This is an expected condition when closing the session
                                            if (this.activeSessions.has(sessionId)) {
                                                console.log(`Session \${ sessionId } closed during wait`);
                                            }
                                            return { value: undefined, done: true };
                                        }
                                    }
                                    else {
                                        console.error(`Error on event close`, error);
                                    }
                                }
                            }
                            // If queue is still empty or session is inactive, we're done
                            if (session.queue.length === 0 || !session.isActive) {
                                console.log(`Queue empty or session inactive: ${sessionId} `);
                                return { value: undefined, done: true };
                            }
                            // Get next item from the session's queue
                            const nextEvent = session.queue.shift();
                            eventCount++;
                            //console.log(`Sending event #${ eventCount } for session ${ sessionId }: ${ JSON.stringify(nextEvent).substring(0, 100) }...`);
                            return {
                                value: {
                                    chunk: {
                                        bytes: new TextEncoder().encode(JSON.stringify(nextEvent))
                                    }
                                },
                                done: false
                            };
                        }
                        catch (error) {
                            console.error(`Error in session ${sessionId} iterator: `, error);
                            session.isActive = false;
                            return { value: undefined, done: true };
                        }
                    },
                    return: async () => {
                        console.log(`Iterator return () called for session ${sessionId}`);
                        session.isActive = false;
                        return { value: undefined, done: true };
                    },
                    throw: async (error) => {
                        console.log(`Iterator throw () called for session ${sessionId} with error: `, error);
                        session.isActive = false;
                        throw error;
                    }
                };
            }
        };
    }
    // Process the response stream from AWS Bedrock
    async processResponseStream(sessionId, response) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        try {
            for await (const event of response.body) {
                if (!session.isActive) {
                    console.log(`Session ${sessionId} is no longer active, stopping response processing`);
                    break;
                }
                if (event.chunk?.bytes) {
                    try {
                        this.updateSessionActivity(sessionId);
                        const textResponse = new TextDecoder().decode(event.chunk.bytes);
                        try {
                            const jsonResponse = JSON.parse(textResponse);
                            if (jsonResponse.event?.contentStart) {
                                this.dispatchEvent(sessionId, 'contentStart', jsonResponse.event.contentStart);
                            }
                            else if (jsonResponse.event?.textOutput) {
                                this.dispatchEvent(sessionId, 'textOutput', jsonResponse.event.textOutput);
                            }
                            else if (jsonResponse.event?.audioOutput) {
                                this.dispatchEvent(sessionId, 'audioOutput', jsonResponse.event.audioOutput);
                            }
                            else if (jsonResponse.event?.toolUse) {
                                this.dispatchEvent(sessionId, 'toolUse', jsonResponse.event.toolUse);
                                // Store tool use information for later
                                session.toolUseContent = jsonResponse.event.toolUse;
                                session.toolUseId = jsonResponse.event.toolUse.toolUseId;
                                session.toolName = jsonResponse.event.toolUse.toolName;
                            }
                            else if (jsonResponse.event?.contentEnd &&
                                jsonResponse.event?.contentEnd?.type === 'TOOL') {
                                // Process tool use
                                console.log(`Processing tool use for session ${sessionId}`);
                                this.dispatchEvent(sessionId, 'toolEnd', {
                                    toolUseContent: session.toolUseContent,
                                    toolUseId: session.toolUseId,
                                    toolName: session.toolName
                                });
                                console.log("calling tooluse");
                                console.log("tool use content : ", session.toolUseContent);
                                // function calling
                                const toolResult = await this.processToolUse(session.toolName, session.toolUseContent);
                                // Send tool result
                                this.sendToolResult(sessionId, session.toolUseId, toolResult);
                                // Also dispatch event about tool result
                                this.dispatchEvent(sessionId, 'toolResult', {
                                    toolUseId: session.toolUseId,
                                    result: toolResult
                                });
                            }
                            else if (jsonResponse.event?.contentEnd) {
                                this.dispatchEvent(sessionId, 'contentEnd', jsonResponse.event.contentEnd);
                            }
                            else {
                                // Handle other events
                                const eventKeys = Object.keys(jsonResponse.event || {});
                                console.log(`Event keys for session ${sessionId}: `, eventKeys);
                                console.log(`Handling other events`);
                                if (eventKeys.length > 0) {
                                    this.dispatchEvent(sessionId, eventKeys[0], jsonResponse.event);
                                }
                                else if (Object.keys(jsonResponse).length > 0) {
                                    this.dispatchEvent(sessionId, 'unknown', jsonResponse);
                                }
                            }
                        }
                        catch (e) {
                            console.log(`Raw text response for session ${sessionId}(parse error): `, textResponse);
                        }
                    }
                    catch (e) {
                        console.error(`Error processing response chunk for session ${sessionId}: `, e);
                    }
                }
                else if (event.modelStreamErrorException) {
                    console.error(`Model stream error for session ${sessionId}: `, event.modelStreamErrorException);
                    this.dispatchEvent(sessionId, 'error', {
                        type: 'modelStreamErrorException',
                        details: event.modelStreamErrorException
                    });
                }
                else if (event.internalServerException) {
                    console.error(`Internal server error for session ${sessionId}: `, event.internalServerException);
                    this.dispatchEvent(sessionId, 'error', {
                        type: 'internalServerException',
                        details: event.internalServerException
                    });
                }
            }
            console.log(`Response stream processing complete for session ${sessionId}`);
            this.dispatchEvent(sessionId, 'streamComplete', {
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error(`Error processing response stream for session ${sessionId}: `, error);
            this.dispatchEvent(sessionId, 'error', {
                source: 'responseStream',
                message: 'Error processing response stream',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }
    // Add an event to a session's queue
    addEventToSessionQueue(sessionId, event) {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive)
            return;
        this.updateSessionActivity(sessionId);
        session.queue.push(event);
        session.queueSignal.next();
    }
    // Set up initial events for a session
    setupSessionStartEvent(sessionId) {
        console.log(`Setting up initial events for session ${sessionId}...`);
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        // Session start event
        this.addEventToSessionQueue(sessionId, {
            event: {
                sessionStart: {
                    inferenceConfiguration: session.inferenceConfig
                }
            }
        });
    }
    setupPromptStartEvent(sessionId) {
        console.log(`Setting up prompt start event for session ${sessionId}...`);
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        // Prompt start event
        this.addEventToSessionQueue(sessionId, {
            event: {
                promptStart: {
                    promptName: session.promptName,
                    textOutputConfiguration: {
                        mediaType: "text/plain",
                    },
                    audioOutputConfiguration: consts_1.DefaultAudioOutputConfiguration,
                    toolUseOutputConfiguration: {
                        mediaType: "application/json",
                    },
                    toolConfiguration: {
                        tools: [{
                                toolSpec: {
                                    name: "getDateAndTimeTool",
                                    description: "Get information about the current date and time.",
                                    inputSchema: {
                                        json: consts_1.DefaultToolSchema
                                    }
                                }
                            },
                            {
                                toolSpec: {
                                    name: "getWeatherTool",
                                    description: "Get the current weather for a given location, based on its WGS84 coordinates.",
                                    inputSchema: {
                                        json: consts_1.WeatherToolSchema
                                    }
                                }
                            }
                        ]
                    },
                },
            }
        });
        session.isPromptStartSent = true;
    }
    setupSystemPromptEvent(sessionId, textConfig = consts_1.DefaultTextConfiguration, systemPromptContent = consts_1.DefaultSystemPrompt) {
        console.log(`Setting up systemPrompt events for session ${sessionId}...`);
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        // Text content start
        const textPromptID = (0, node_crypto_1.randomUUID)();
        this.addEventToSessionQueue(sessionId, {
            event: {
                contentStart: {
                    promptName: session.promptName,
                    contentName: textPromptID,
                    type: "TEXT",
                    interactive: true,
                    role: "SYSTEM",
                    textInputConfiguration: textConfig,
                },
            }
        });
        // Text input content
        this.addEventToSessionQueue(sessionId, {
            event: {
                textInput: {
                    promptName: session.promptName,
                    contentName: textPromptID,
                    content: systemPromptContent,
                },
            }
        });
        // Text content end
        this.addEventToSessionQueue(sessionId, {
            event: {
                contentEnd: {
                    promptName: session.promptName,
                    contentName: textPromptID,
                },
            }
        });
    }
    setupStartAudioEvent(sessionId, audioConfig = consts_1.DefaultAudioInputConfiguration) {
        console.log(`Setting up startAudioContent event for session ${sessionId}...`);
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        console.log(`Using audio content ID: ${session.audioContentId}`);
        // Audio content start
        this.addEventToSessionQueue(sessionId, {
            event: {
                contentStart: {
                    promptName: session.promptName,
                    contentName: session.audioContentId,
                    type: "AUDIO",
                    interactive: true,
                    role: "USER",
                    audioInputConfiguration: audioConfig,
                },
            }
        });
        session.isAudioContentStartSent = true;
        console.log(`Initial events setup complete for session ${sessionId}`);
    }
    // Stream an audio chunk for a session
    async streamAudioChunk(sessionId, audioData) {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive || !session.audioContentId) {
            throw new Error(`Invalid session ${sessionId} for audio streaming`);
        }
        // Convert audio to base64
        const base64Data = audioData.toString('base64');
        this.addEventToSessionQueue(sessionId, {
            event: {
                audioInput: {
                    promptName: session.promptName,
                    contentName: session.audioContentId,
                    content: base64Data,
                },
            }
        });
    }
    // Send tool result back to the model
    async sendToolResult(sessionId, toolUseId, result) {
        const session = this.activeSessions.get(sessionId);
        console.log("inside tool result");
        if (!session || !session.isActive)
            return;
        console.log(`Sending tool result for session ${sessionId}, tool use ID: ${toolUseId}`);
        const contentId = (0, node_crypto_1.randomUUID)();
        // Tool content start
        this.addEventToSessionQueue(sessionId, {
            event: {
                contentStart: {
                    promptName: session.promptName,
                    contentName: contentId,
                    interactive: false,
                    type: "TOOL",
                    role: "TOOL",
                    toolResultInputConfiguration: {
                        toolUseId: toolUseId,
                        type: "TEXT",
                        textInputConfiguration: {
                            mediaType: "text/plain"
                        }
                    }
                }
            }
        });
        // Tool content input
        const resultContent = typeof result === 'string' ? result : JSON.stringify(result);
        this.addEventToSessionQueue(sessionId, {
            event: {
                toolResult: {
                    promptName: session.promptName,
                    contentName: contentId,
                    content: resultContent
                }
            }
        });
        // Tool content end
        this.addEventToSessionQueue(sessionId, {
            event: {
                contentEnd: {
                    promptName: session.promptName,
                    contentName: contentId
                }
            }
        });
        console.log(`Tool result sent for session ${sessionId}`);
    }
    async sendContentEnd(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isAudioContentStartSent)
            return;
        await this.addEventToSessionQueue(sessionId, {
            event: {
                contentEnd: {
                    promptName: session.promptName,
                    contentName: session.audioContentId,
                }
            }
        });
        // Wait to ensure it's processed
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    async sendPromptEnd(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isPromptStartSent)
            return;
        await this.addEventToSessionQueue(sessionId, {
            event: {
                promptEnd: {
                    promptName: session.promptName
                }
            }
        });
        // Wait to ensure it's processed
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    async sendSessionEnd(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        await this.addEventToSessionQueue(sessionId, {
            event: {
                sessionEnd: {}
            }
        });
        // Wait to ensure it's processed
        await new Promise(resolve => setTimeout(resolve, 300));
        // Now it's safe to clean up
        session.isActive = false;
        session.closeSignal.next();
        session.closeSignal.complete();
        this.activeSessions.delete(sessionId);
        this.sessionLastActivity.delete(sessionId);
        console.log(`Session ${sessionId} closed and removed from active sessions`);
    }
    // Register an event handler for a session
    registerEventHandler(sessionId, eventType, handler) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.responseHandlers.set(eventType, handler);
    }
    // Dispatch an event to registered handlers
    dispatchEvent(sessionId, eventType, data) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        const handler = session.responseHandlers.get(eventType);
        if (handler) {
            try {
                handler(data);
            }
            catch (e) {
                console.error(`Error in ${eventType} handler for session ${sessionId}:`, e);
            }
        }
        // Also dispatch to "any" handlers
        const anyHandler = session.responseHandlers.get('any');
        if (anyHandler) {
            try {
                anyHandler({ type: eventType, data });
            }
            catch (e) {
                console.error(`Error in 'any' handler for session ${sessionId}:`, e);
            }
        }
    }
    async closeSession(sessionId) {
        if (this.sessionCleanupInProgress.has(sessionId)) {
            console.log(`Cleanup already in progress for session ${sessionId}, skipping`);
            return;
        }
        this.sessionCleanupInProgress.add(sessionId);
        try {
            console.log(`Starting close process for session ${sessionId}`);
            await this.sendContentEnd(sessionId);
            await this.sendPromptEnd(sessionId);
            await this.sendSessionEnd(sessionId);
            console.log(`Session ${sessionId} cleanup complete`);
        }
        catch (error) {
            console.error(`Error during closing sequence for session ${sessionId}:`, error);
            // Ensure cleanup happens even if there's an error
            const session = this.activeSessions.get(sessionId);
            if (session) {
                session.isActive = false;
                this.activeSessions.delete(sessionId);
                this.sessionLastActivity.delete(sessionId);
            }
        }
        finally {
            // Always clean up the tracking set
            this.sessionCleanupInProgress.delete(sessionId);
        }
    }
    // Same for forceCloseSession:
    forceCloseSession(sessionId) {
        if (this.sessionCleanupInProgress.has(sessionId) || !this.activeSessions.has(sessionId)) {
            console.log(`Session ${sessionId} already being cleaned up or not active`);
            return;
        }
        this.sessionCleanupInProgress.add(sessionId);
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session)
                return;
            console.log(`Force closing session ${sessionId}`);
            // Immediately mark as inactive and clean up resources
            session.isActive = false;
            session.closeSignal.next();
            session.closeSignal.complete();
            this.activeSessions.delete(sessionId);
            this.sessionLastActivity.delete(sessionId);
            console.log(`Session ${sessionId} force closed`);
        }
        finally {
            this.sessionCleanupInProgress.delete(sessionId);
        }
    }
}
exports.NovaSonicBidirectionalStreamClient = NovaSonicBidirectionalStreamClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDRFQUt5QztBQUN6QyxrREFBMEI7QUFDMUIsa0RBQTBCO0FBQzFCLGlFQUdtQztBQUduQyw2Q0FBeUM7QUFFekMsK0JBQStCO0FBQy9CLDhDQUFzQztBQUN0QywrQkFBc0M7QUFDdEMscUNBT2tCO0FBVWxCLE1BQWEsYUFBYTtJQU14QixZQUNVLFNBQWlCLEVBQ2pCLE1BQTBDO1FBRDFDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBb0M7UUFQNUMscUJBQWdCLEdBQWEsRUFBRSxDQUFDO1FBQ2hDLGlCQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsMENBQTBDO1FBQzlELHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMxQixhQUFRLEdBQUcsSUFBSSxDQUFDO0lBS3BCLENBQUM7SUFFTCxvREFBb0Q7SUFDN0MsT0FBTyxDQUFDLFNBQWlCLEVBQUUsT0FBNEI7UUFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxPQUFPLElBQUksQ0FBQyxDQUFDLGVBQWU7SUFDOUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxnQkFBZ0I7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLEtBQUssQ0FBQyxpQkFBaUIsQ0FDNUIsYUFBOEMsaUNBQXdCLEVBQ3RFLHNCQUE4Qiw0QkFBbUI7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZSxDQUMxQixjQUFx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QUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxTQUFTLHlDQUF5QyxDQUFDLENBQUM7WUFDM0UsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU87WUFFckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUVsRCxzREFBc0Q7WUFDdEQsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDekIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLFNBQVMsZUFBZSxDQUFDLENBQUM7UUFDbkQsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQztDQUVGO0FBaHlCRCxnRkFneUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQmVkcm9ja1J1bnRpbWVDbGllbnQsXG4gIEJlZHJvY2tSdW50aW1lQ2xpZW50Q29uZmlnLFxuICBJbnZva2VNb2RlbFdpdGhCaWRpcmVjdGlvbmFsU3RyZWFtQ29tbWFuZCxcbiAgSW52b2tlTW9kZWxXaXRoQmlkaXJlY3Rpb25hbFN0cmVhbUlucHV0LFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWJlZHJvY2stcnVudGltZVwiO1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQge1xuICBOb2RlSHR0cDJIYW5kbGVyLFxuICBOb2RlSHR0cDJIYW5kbGVyT3B0aW9ucyxcbn0gZnJvbSBcIkBzbWl0aHkvbm9kZS1odHRwLWhhbmRsZXJcIjtcbmltcG9ydCB7IFByb3ZpZGVyIH0gZnJvbSBcIkBzbWl0aHkvdHlwZXNcIjtcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJub2RlOmJ1ZmZlclwiO1xuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHsgSW5mZXJlbmNlQ29uZmlnIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBmaXJzdFZhbHVlRnJvbSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdEF1ZGlvSW5wdXRDb25maWd1cmF0aW9uLFxuICBEZWZhdWx0QXVkaW9PdXRwdXRDb25maWd1cmF0aW9uLFxuICBEZWZhdWx0U3lzdGVtUHJvbXB0LFxuICBEZWZhdWx0VGV4dENvbmZpZ3VyYXRpb24sXG4gIERlZmF1bHRUb29sU2NoZW1hLFxuICBXZWF0aGVyVG9vbFNjaGVtYVxufSBmcm9tIFwiLi9jb25zdHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBOb3ZhU29uaWNCaWRpcmVjdGlvbmFsU3RyZWFtQ2xpZW50Q29uZmlnIHtcbiAgcmVxdWVzdEhhbmRsZXJDb25maWc/OlxuICB8IE5vZGVIdHRwMkhhbmRsZXJPcHRpb25zXG4gIHwgUHJvdmlkZXI8Tm9kZUh0dHAySGFuZGxlck9wdGlvbnMgfCB2b2lkPjtcbiAgY2xpZW50Q29uZmlnOiBQYXJ0aWFsPEJlZHJvY2tSdW50aW1lQ2xpZW50Q29uZmlnPjtcbiAgaW5mZXJlbmNlQ29uZmlnPzogSW5mZXJlbmNlQ29uZmlnO1xufVxuXG5leHBvcnQgY2xhc3MgU3RyZWFtU2Vzc2lvbiB7XG4gIHByaXZhdGUgYXVkaW9CdWZmZXJRdWV1ZTogQnVmZmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBtYXhRdWV1ZVNpemUgPSAyMDA7IC8vIE1heGltdW0gbnVtYmVyIG9mIGF1ZGlvIGNodW5rcyB0byBxdWV1ZVxuICBwcml2YXRlIGlzUHJvY2Vzc2luZ0F1ZGlvID0gZmFsc2U7XG4gIHByaXZhdGUgaXNBY3RpdmUgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBjbGllbnQ6IE5vdmFTb25pY0JpZGlyZWN0aW9uYWxTdHJlYW1DbGllbnRcbiAgKSB7IH1cblxuICAvLyBSZWdpc3RlciBldmVudCBoYW5kbGVycyBmb3IgdGhpcyBzcGVjaWZpYyBzZXNzaW9uXG4gIHB1YmxpYyBvbkV2ZW50KGV2ZW50VHlwZTogc3RyaW5nLCBoYW5kbGVyOiAoZGF0YTogYW55KSA9PiB2b2lkKTogU3RyZWFtU2Vzc2lvbiB7XG4gICAgdGhpcy5jbGllbnQucmVnaXN0ZXJFdmVudEhhbmRsZXIodGhpcy5zZXNzaW9uSWQsIGV2ZW50VHlwZSwgaGFuZGxlcik7XG4gICAgcmV0dXJuIHRoaXM7IC8vIEZvciBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHNldHVwUHJvbXB0U3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jbGllbnQuc2V0dXBQcm9tcHRTdGFydEV2ZW50KHRoaXMuc2Vzc2lvbklkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzZXR1cFN5c3RlbVByb21wdChcbiAgICB0ZXh0Q29uZmlnOiB0eXBlb2YgRGVmYXVsdFRleHRDb25maWd1cmF0aW9uID0gRGVmYXVsdFRleHRDb25maWd1cmF0aW9uLFxuICAgIHN5c3RlbVByb21wdENvbnRlbnQ6IHN0cmluZyA9IERlZmF1bHRTeXN0ZW1Qcm9tcHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNsaWVudC5zZXR1cFN5c3RlbVByb21wdEV2ZW50KHRoaXMuc2Vzc2lvbklkLCB0ZXh0Q29uZmlnLCBzeXN0ZW1Qcm9tcHRDb250ZW50KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzZXR1cFN0YXJ0QXVkaW8oXG4gICAgYXVkaW9Db25maWc6IHR5cGVvZiBEZWZhdWx0QXVkaW9JbnB1dENvbmZpZ3VyYXRpb24gPSBEZWZhdWx0QXVkaW9JbnB1dENvbmZpZ3VyYXRpb25cbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jbGllbnQuc2V0dXBTdGFydEF1ZGlvRXZlbnQodGhpcy5zZXNzaW9uSWQsIGF1ZGlvQ29uZmlnKTtcbiAgfVxuXG5cbiAgLy8gU3RyZWFtIGF1ZGlvIGZvciB0aGlzIHNlc3Npb25cbiAgcHVibGljIGFzeW5jIHN0cmVhbUF1ZGlvKGF1ZGlvRGF0YTogQnVmZmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gQ2hlY2sgcXVldWUgc2l6ZSB0byBhdm9pZCBtZW1vcnkgaXNzdWVzXG4gICAgaWYgKHRoaXMuYXVkaW9CdWZmZXJRdWV1ZS5sZW5ndGggPj0gdGhpcy5tYXhRdWV1ZVNpemUpIHtcbiAgICAgIC8vIFF1ZXVlIGlzIGZ1bGwsIGRyb3Agb2xkZXN0IGNodW5rXG4gICAgICB0aGlzLmF1ZGlvQnVmZmVyUXVldWUuc2hpZnQoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW8gcXVldWUgZnVsbCwgZHJvcHBpbmcgb2xkZXN0IGNodW5rXCIpO1xuICAgIH1cblxuICAgIC8vIFF1ZXVlIHRoZSBhdWRpbyBjaHVuayBmb3Igc3RyZWFtaW5nXG4gICAgdGhpcy5hdWRpb0J1ZmZlclF1ZXVlLnB1c2goYXVkaW9EYXRhKTtcbiAgICB0aGlzLnByb2Nlc3NBdWRpb1F1ZXVlKCk7XG4gIH1cblxuICAvLyBQcm9jZXNzIGF1ZGlvIHF1ZXVlIGZvciBjb250aW51b3VzIHN0cmVhbWluZ1xuICBwcml2YXRlIGFzeW5jIHByb2Nlc3NBdWRpb1F1ZXVlKCkge1xuICAgIGlmICh0aGlzLmlzUHJvY2Vzc2luZ0F1ZGlvIHx8IHRoaXMuYXVkaW9CdWZmZXJRdWV1ZS5sZW5ndGggPT09IDAgfHwgIXRoaXMuaXNBY3RpdmUpIHJldHVybjtcblxuICAgIHRoaXMuaXNQcm9jZXNzaW5nQXVkaW8gPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAvLyBQcm9jZXNzIGFsbCBjaHVua3MgaW4gdGhlIHF1ZXVlLCB1cCB0byBhIHJlYXNvbmFibGUgbGltaXRcbiAgICAgIGxldCBwcm9jZXNzZWRDaHVua3MgPSAwO1xuICAgICAgY29uc3QgbWF4Q2h1bmtzUGVyQmF0Y2ggPSA1OyAvLyBQcm9jZXNzIG1heCA1IGNodW5rcyBhdCBhIHRpbWUgdG8gYXZvaWQgb3ZlcmxvYWRcblxuICAgICAgd2hpbGUgKHRoaXMuYXVkaW9CdWZmZXJRdWV1ZS5sZW5ndGggPiAwICYmIHByb2Nlc3NlZENodW5rcyA8IG1heENodW5rc1BlckJhdGNoICYmIHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgY29uc3QgYXVkaW9DaHVuayA9IHRoaXMuYXVkaW9CdWZmZXJRdWV1ZS5zaGlmdCgpO1xuICAgICAgICBpZiAoYXVkaW9DaHVuaykge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnN0cmVhbUF1ZGlvQ2h1bmsodGhpcy5zZXNzaW9uSWQsIGF1ZGlvQ2h1bmspO1xuICAgICAgICAgIHByb2Nlc3NlZENodW5rcysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuaXNQcm9jZXNzaW5nQXVkaW8gPSBmYWxzZTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIHN0aWxsIGl0ZW1zIGluIHRoZSBxdWV1ZSwgc2NoZWR1bGUgdGhlIG5leHQgcHJvY2Vzc2luZyB1c2luZyBzZXRUaW1lb3V0XG4gICAgICBpZiAodGhpcy5hdWRpb0J1ZmZlclF1ZXVlLmxlbmd0aCA+IDAgJiYgdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucHJvY2Vzc0F1ZGlvUXVldWUoKSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIEdldCBzZXNzaW9uIElEXG4gIHB1YmxpYyBnZXRTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uSWQ7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZW5kQXVkaW9Db250ZW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5pc0FjdGl2ZSkgcmV0dXJuO1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnNlbmRDb250ZW50RW5kKHRoaXMuc2Vzc2lvbklkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBlbmRQcm9tcHQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmlzQWN0aXZlKSByZXR1cm47XG4gICAgYXdhaXQgdGhpcy5jbGllbnQuc2VuZFByb21wdEVuZCh0aGlzLnNlc3Npb25JZCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmlzQWN0aXZlKSByZXR1cm47XG5cbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5hdWRpb0J1ZmZlclF1ZXVlID0gW107IC8vIENsZWFyIGFueSBwZW5kaW5nIGF1ZGlvXG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5zZW5kU2Vzc2lvbkVuZCh0aGlzLnNlc3Npb25JZCk7XG4gICAgY29uc29sZS5sb2coYFNlc3Npb24gJHt0aGlzLnNlc3Npb25JZH0gY2xvc2UgY29tcGxldGVkYCk7XG4gIH1cbn1cblxuLy8gU2Vzc2lvbiBkYXRhIHR5cGVcbmludGVyZmFjZSBTZXNzaW9uRGF0YSB7XG4gIHF1ZXVlOiBBcnJheTxhbnk+O1xuICBxdWV1ZVNpZ25hbDogU3ViamVjdDx2b2lkPjtcbiAgY2xvc2VTaWduYWw6IFN1YmplY3Q8dm9pZD47XG4gIHJlc3BvbnNlU3ViamVjdDogU3ViamVjdDxhbnk+O1xuICB0b29sVXNlQ29udGVudDogYW55O1xuICB0b29sVXNlSWQ6IHN0cmluZztcbiAgdG9vbE5hbWU6IHN0cmluZztcbiAgcmVzcG9uc2VIYW5kbGVyczogTWFwPHN0cmluZywgKGRhdGE6IGFueSkgPT4gdm9pZD47XG4gIHByb21wdE5hbWU6IHN0cmluZztcbiAgaW5mZXJlbmNlQ29uZmlnOiBJbmZlcmVuY2VDb25maWc7XG4gIGlzQWN0aXZlOiBib29sZWFuO1xuICBpc1Byb21wdFN0YXJ0U2VudDogYm9vbGVhbjtcbiAgaXNBdWRpb0NvbnRlbnRTdGFydFNlbnQ6IGJvb2xlYW47XG4gIGF1ZGlvQ29udGVudElkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBOb3ZhU29uaWNCaWRpcmVjdGlvbmFsU3RyZWFtQ2xpZW50IHtcbiAgcHJpdmF0ZSBiZWRyb2NrUnVudGltZUNsaWVudDogQmVkcm9ja1J1bnRpbWVDbGllbnQ7XG4gIHByaXZhdGUgaW5mZXJlbmNlQ29uZmlnOiBJbmZlcmVuY2VDb25maWc7XG4gIHByaXZhdGUgYWN0aXZlU2Vzc2lvbnM6IE1hcDxzdHJpbmcsIFNlc3Npb25EYXRhPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBzZXNzaW9uTGFzdEFjdGl2aXR5OiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIHNlc3Npb25DbGVhbnVwSW5Qcm9ncmVzcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBOb3ZhU29uaWNCaWRpcmVjdGlvbmFsU3RyZWFtQ2xpZW50Q29uZmlnKSB7XG4gICAgY29uc3Qgbm9kZUh0dHAySGFuZGxlciA9IG5ldyBOb2RlSHR0cDJIYW5kbGVyKHtcbiAgICAgIHJlcXVlc3RUaW1lb3V0OiAzMDAwMDAsXG4gICAgICBzZXNzaW9uVGltZW91dDogMzAwMDAwLFxuICAgICAgZGlzYWJsZUNvbmN1cnJlbnRTdHJlYW1zOiBmYWxzZSxcbiAgICAgIG1heENvbmN1cnJlbnRTdHJlYW1zOiAyMCxcbiAgICAgIC4uLmNvbmZpZy5yZXF1ZXN0SGFuZGxlckNvbmZpZyxcbiAgICB9KTtcblxuICAgIGlmICghY29uZmlnLmNsaWVudENvbmZpZy5jcmVkZW50aWFscykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY3JlZGVudGlhbHMgcHJvdmlkZWRcIik7XG4gICAgfVxuXG4gICAgdGhpcy5iZWRyb2NrUnVudGltZUNsaWVudCA9IG5ldyBCZWRyb2NrUnVudGltZUNsaWVudCh7XG4gICAgICAuLi5jb25maWcuY2xpZW50Q29uZmlnLFxuICAgICAgY3JlZGVudGlhbHM6IGNvbmZpZy5jbGllbnRDb25maWcuY3JlZGVudGlhbHMsXG4gICAgICByZWdpb246IGNvbmZpZy5jbGllbnRDb25maWcucmVnaW9uIHx8IFwidXMtZWFzdC0xXCIsXG4gICAgICByZXF1ZXN0SGFuZGxlcjogbm9kZUh0dHAySGFuZGxlclxuICAgIH0pO1xuXG4gICAgdGhpcy5pbmZlcmVuY2VDb25maWcgPSBjb25maWcuaW5mZXJlbmNlQ29uZmlnID8/IHtcbiAgICAgIG1heFRva2VuczogMTAyNCxcbiAgICAgIHRvcFA6IDAuOSxcbiAgICAgIHRlbXBlcmF0dXJlOiAwLjcsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBpc1Nlc3Npb25BY3RpdmUoc2Vzc2lvbklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICByZXR1cm4gISFzZXNzaW9uICYmIHNlc3Npb24uaXNBY3RpdmU7XG4gIH1cblxuICBwdWJsaWMgZ2V0QWN0aXZlU2Vzc2lvbnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRMYXN0QWN0aXZpdHlUaW1lKHNlc3Npb25JZDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uTGFzdEFjdGl2aXR5LmdldChzZXNzaW9uSWQpIHx8IDA7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNlc3Npb25BY3Rpdml0eShzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2Vzc2lvbkxhc3RBY3Rpdml0eS5zZXQoc2Vzc2lvbklkLCBEYXRlLm5vdygpKTtcbiAgfVxuXG4gIHB1YmxpYyBpc0NsZWFudXBJblByb2dyZXNzKHNlc3Npb25JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNsZWFudXBJblByb2dyZXNzLmhhcyhzZXNzaW9uSWQpO1xuICB9XG5cblxuICAvLyBDcmVhdGUgYSBuZXcgc3RyZWFtaW5nIHNlc3Npb25cbiAgcHVibGljIGNyZWF0ZVN0cmVhbVNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcgPSByYW5kb21VVUlEKCksIGNvbmZpZz86IE5vdmFTb25pY0JpZGlyZWN0aW9uYWxTdHJlYW1DbGllbnRDb25maWcpOiBTdHJlYW1TZXNzaW9uIHtcbiAgICBpZiAodGhpcy5hY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvbklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdHJlYW0gc2Vzc2lvbiB3aXRoIElEICR7c2Vzc2lvbklkfSBhbHJlYWR5IGV4aXN0c2ApO1xuICAgIH1cblxuICAgIGNvbnN0IHNlc3Npb246IFNlc3Npb25EYXRhID0ge1xuICAgICAgcXVldWU6IFtdLFxuICAgICAgcXVldWVTaWduYWw6IG5ldyBTdWJqZWN0PHZvaWQ+KCksXG4gICAgICBjbG9zZVNpZ25hbDogbmV3IFN1YmplY3Q8dm9pZD4oKSxcbiAgICAgIHJlc3BvbnNlU3ViamVjdDogbmV3IFN1YmplY3Q8YW55PigpLFxuICAgICAgdG9vbFVzZUNvbnRlbnQ6IG51bGwsXG4gICAgICB0b29sVXNlSWQ6IFwiXCIsXG4gICAgICB0b29sTmFtZTogXCJcIixcbiAgICAgIHJlc3BvbnNlSGFuZGxlcnM6IG5ldyBNYXAoKSxcbiAgICAgIHByb21wdE5hbWU6IHJhbmRvbVVVSUQoKSxcbiAgICAgIGluZmVyZW5jZUNvbmZpZzogY29uZmlnPy5pbmZlcmVuY2VDb25maWcgPz8gdGhpcy5pbmZlcmVuY2VDb25maWcsXG4gICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgIGlzUHJvbXB0U3RhcnRTZW50OiBmYWxzZSxcbiAgICAgIGlzQXVkaW9Db250ZW50U3RhcnRTZW50OiBmYWxzZSxcbiAgICAgIGF1ZGlvQ29udGVudElkOiByYW5kb21VVUlEKClcbiAgICB9O1xuXG4gICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbklkLCBzZXNzaW9uKTtcblxuICAgIHJldHVybiBuZXcgU3RyZWFtU2Vzc2lvbihzZXNzaW9uSWQsIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwcm9jZXNzVG9vbFVzZSh0b29sTmFtZTogc3RyaW5nLCB0b29sVXNlQ29udGVudDogb2JqZWN0KTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBjb25zdCB0b29sID0gdG9vbE5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHN3aXRjaCAodG9vbCkge1xuICAgICAgY2FzZSBcImdldGRhdGVhbmR0aW1ldG9vbFwiOlxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0xvY2FsZVN0cmluZyhcImVuLVVTXCIsIHsgdGltZVpvbmU6IFwiQW1lcmljYS9Mb3NfQW5nZWxlc1wiIH0pO1xuICAgICAgICBjb25zdCBwc3REYXRlID0gbmV3IERhdGUoZGF0ZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZGF0ZTogcHN0RGF0ZS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgICAgICAgeWVhcjogcHN0RGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgIG1vbnRoOiBwc3REYXRlLmdldE1vbnRoKCkgKyAxLFxuICAgICAgICAgIGRheTogcHN0RGF0ZS5nZXREYXRlKCksXG4gICAgICAgICAgZGF5T2ZXZWVrOiBwc3REYXRlLnRvTG9jYWxlU3RyaW5nKCdlbi1VUycsIHsgd2Vla2RheTogJ2xvbmcnIH0pLnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgdGltZXpvbmU6IFwiUFNUXCIsXG4gICAgICAgICAgZm9ybWF0dGVkVGltZTogcHN0RGF0ZS50b0xvY2FsZVRpbWVTdHJpbmcoJ2VuLVVTJywge1xuICAgICAgICAgICAgaG91cjEyOiB0cnVlLFxuICAgICAgICAgICAgaG91cjogJzItZGlnaXQnLFxuICAgICAgICAgICAgbWludXRlOiAnMi1kaWdpdCdcbiAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgICAgY2FzZSBcImdldHdlYXRoZXJ0b29sXCI6XG4gICAgICAgIGNvbnNvbGUubG9nKGB3ZWF0aGVyIHRvb2xgKVxuICAgICAgICBjb25zdCBwYXJzZWRDb250ZW50ID0gYXdhaXQgdGhpcy5wYXJzZVRvb2xVc2VDb250ZW50Rm9yV2VhdGhlcih0b29sVXNlQ29udGVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGFyc2VkIGNvbnRlbnRcIilcbiAgICAgICAgaWYgKCFwYXJzZWRDb250ZW50KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXJzZWRDb250ZW50IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoV2VhdGhlckRhdGEocGFyc2VkQ29udGVudD8ubGF0aXR1ZGUsIHBhcnNlZENvbnRlbnQ/LmxvbmdpdHVkZSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmxvZyhgVG9vbCAke3Rvb2x9IG5vdCBzdXBwb3J0ZWRgKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRvb2wgJHt0b29sfSBub3Qgc3VwcG9ydGVkYCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwYXJzZVRvb2xVc2VDb250ZW50Rm9yV2VhdGhlcih0b29sVXNlQ29udGVudDogYW55KTogUHJvbWlzZTx7IGxhdGl0dWRlOiBudW1iZXI7IGxvbmdpdHVkZTogbnVtYmVyOyB9IHwgbnVsbD4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgY29udGVudCBmaWVsZCBleGlzdHMgYW5kIGlzIGEgc3RyaW5nXG4gICAgICBpZiAodG9vbFVzZUNvbnRlbnQgJiYgdHlwZW9mIHRvb2xVc2VDb250ZW50LmNvbnRlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIFBhcnNlIHRoZSBKU09OIHN0cmluZyBpbnRvIGFuIG9iamVjdFxuICAgICAgICBjb25zdCBwYXJzZWRDb250ZW50ID0gSlNPTi5wYXJzZSh0b29sVXNlQ29udGVudC5jb250ZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coYHBhcnNlZENvbnRlbnQgJHtwYXJzZWRDb250ZW50fWApXG4gICAgICAgIC8vIFJldHVybiB0aGUgcGFyc2VkIGNvbnRlbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsYXRpdHVkZTogcGFyc2VkQ29udGVudC5sYXRpdHVkZSxcbiAgICAgICAgICBsb25naXR1ZGU6IHBhcnNlZENvbnRlbnQubG9uZ2l0dWRlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBwYXJzZSB0b29sIHVzZSBjb250ZW50OlwiLCBlcnJvcik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuXG4gIHByaXZhdGUgYXN5bmMgZmV0Y2hXZWF0aGVyRGF0YShcbiAgICBsYXRpdHVkZTogbnVtYmVyLFxuICAgIGxvbmdpdHVkZTogbnVtYmVyXG4gICk6IFByb21pc2U8UmVjb3JkPHN0cmluZywgYW55Pj4ge1xuICAgIGNvbnN0IGlwdjRBZ2VudCA9IG5ldyBodHRwcy5BZ2VudCh7IGZhbWlseTogNCB9KTtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3Blbi1tZXRlby5jb20vdjEvZm9yZWNhc3Q/bGF0aXR1ZGU9JHtsYXRpdHVkZX0mbG9uZ2l0dWRlPSR7bG9uZ2l0dWRlfSZjdXJyZW50X3dlYXRoZXI9dHJ1ZWA7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgICAgIGh0dHBzQWdlbnQ6IGlwdjRBZ2VudCxcbiAgICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdVc2VyLUFnZW50JzogJ015QXBwLzEuMCcsXG4gICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHdlYXRoZXJEYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgIGNvbnNvbGUubG9nKFwid2VhdGhlckRhdGE6XCIsIHdlYXRoZXJEYXRhKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd2VhdGhlcl9kYXRhOiB3ZWF0aGVyRGF0YVxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGF4aW9zLmlzQXhpb3NFcnJvcihlcnJvcikpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZmV0Y2hpbmcgd2VhdGhlciBkYXRhOiAke2Vycm9yLm1lc3NhZ2V9YCwgZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgVW5leHBlY3RlZCBlcnJvcjogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9IGAsIGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN0cmVhbSBhdWRpbyBmb3IgYSBzcGVjaWZpYyBzZXNzaW9uXG4gIHB1YmxpYyBhc3luYyBpbml0aWF0ZVNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3RyZWFtIHNlc3Npb24gJHtzZXNzaW9uSWR9IG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAvLyBTZXQgdXAgaW5pdGlhbCBldmVudHMgZm9yIHRoaXMgc2Vzc2lvblxuICAgICAgdGhpcy5zZXR1cFNlc3Npb25TdGFydEV2ZW50KHNlc3Npb25JZCk7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgYmlkaXJlY3Rpb25hbCBzdHJlYW0gd2l0aCBzZXNzaW9uLXNwZWNpZmljIGFzeW5jIGl0ZXJhdG9yXG4gICAgICBjb25zdCBhc3luY0l0ZXJhYmxlID0gdGhpcy5jcmVhdGVTZXNzaW9uQXN5bmNJdGVyYWJsZShzZXNzaW9uSWQpO1xuXG4gICAgICBjb25zb2xlLmxvZyhgU3RhcnRpbmcgYmlkaXJlY3Rpb25hbCBzdHJlYW0gZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9Li4uYCk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5iZWRyb2NrUnVudGltZUNsaWVudC5zZW5kKFxuICAgICAgICBuZXcgSW52b2tlTW9kZWxXaXRoQmlkaXJlY3Rpb25hbFN0cmVhbUNvbW1hbmQoe1xuICAgICAgICAgIG1vZGVsSWQ6IFwiYW1hem9uLm5vdmEtc29uaWMtdjE6MFwiLFxuICAgICAgICAgIGJvZHk6IGFzeW5jSXRlcmFibGUsXG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBjb25zb2xlLmxvZyhgU3RyZWFtIGVzdGFibGlzaGVkIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfSwgcHJvY2Vzc2luZyByZXNwb25zZXMuLi5gKTtcblxuICAgICAgLy8gUHJvY2VzcyByZXNwb25zZXMgZm9yIHRoaXMgc2Vzc2lvblxuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzUmVzcG9uc2VTdHJlYW0oc2Vzc2lvbklkLCByZXNwb25zZSk7XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gc2Vzc2lvbiAke3Nlc3Npb25JZH06IGAsIGVycm9yKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudEZvclNlc3Npb24oc2Vzc2lvbklkLCAnZXJyb3InLCB7XG4gICAgICAgIHNvdXJjZTogJ2JpZGlyZWN0aW9uYWxTdHJlYW0nLFxuICAgICAgICBlcnJvclxuICAgICAgfSk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0byBjbGVhbiB1cCBpZiB0aGVyZSdzIGFuIGVycm9yXG4gICAgICBpZiAoc2Vzc2lvbi5pc0FjdGl2ZSkge1xuICAgICAgICB0aGlzLmNsb3NlU2Vzc2lvbihzZXNzaW9uSWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIERpc3BhdGNoIGV2ZW50cyB0byBoYW5kbGVycyBmb3IgYSBzcGVjaWZpYyBzZXNzaW9uXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudEZvclNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICBpZiAoIXNlc3Npb24pIHJldHVybjtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBzZXNzaW9uLnJlc3BvbnNlSGFuZGxlcnMuZ2V0KGV2ZW50VHlwZSk7XG4gICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGhhbmRsZXIoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluICR7ZXZlbnRUeXBlfSBoYW5kbGVyIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfTogYCwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxzbyBkaXNwYXRjaCB0byBcImFueVwiIGhhbmRsZXJzXG4gICAgY29uc3QgYW55SGFuZGxlciA9IHNlc3Npb24ucmVzcG9uc2VIYW5kbGVycy5nZXQoJ2FueScpO1xuICAgIGlmIChhbnlIYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhbnlIYW5kbGVyKHsgdHlwZTogZXZlbnRUeXBlLCBkYXRhIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiAnYW55JyBoYW5kbGVyIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfTogYCwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVTZXNzaW9uQXN5bmNJdGVyYWJsZShzZXNzaW9uSWQ6IHN0cmluZyk6IEFzeW5jSXRlcmFibGU8SW52b2tlTW9kZWxXaXRoQmlkaXJlY3Rpb25hbFN0cmVhbUlucHV0PiB7XG5cbiAgICBpZiAoIXRoaXMuaXNTZXNzaW9uQWN0aXZlKHNlc3Npb25JZCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBDYW5ub3QgY3JlYXRlIGFzeW5jIGl0ZXJhYmxlOiBTZXNzaW9uICR7c2Vzc2lvbklkfSBub3QgYWN0aXZlYCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiAoe1xuICAgICAgICAgIG5leHQ6IGFzeW5jICgpID0+ICh7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfSlcbiAgICAgICAgfSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBjcmVhdGUgYXN5bmMgaXRlcmFibGU6IFNlc3Npb24gJHtzZXNzaW9uSWR9IG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIGxldCBldmVudENvdW50ID0gMDtcblxuICAgIHJldHVybiB7XG4gICAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdOiAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBBc3luY0l0ZXJhYmxlIGl0ZXJhdG9yIHJlcXVlc3RlZCBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH1gKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5leHQ6IGFzeW5jICgpOiBQcm9taXNlPEl0ZXJhdG9yUmVzdWx0PEludm9rZU1vZGVsV2l0aEJpZGlyZWN0aW9uYWxTdHJlYW1JbnB1dD4+ID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIHNlc3Npb24gaXMgc3RpbGwgYWN0aXZlXG4gICAgICAgICAgICAgIGlmICghc2Vzc2lvbi5pc0FjdGl2ZSB8fCAhdGhpcy5hY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvbklkKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJdGVyYXRvciBjbG9zaW5nIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfSwgZG9uZSA9IHRydWVgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gV2FpdCBmb3IgaXRlbXMgaW4gdGhlIHF1ZXVlIG9yIGNsb3NlIHNpZ25hbFxuICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RWYWx1ZUZyb20oc2Vzc2lvbi5xdWV1ZVNpZ25hbC5waXBlKHRha2UoMSkpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RWYWx1ZUZyb20oc2Vzc2lvbi5jbG9zZVNpZ25hbC5waXBlKHRha2UoMSkpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJlYW0gY2xvc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSBcIlN0cmVhbSBjbG9zZWRcIiB8fCAhc2Vzc2lvbi5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gZXhwZWN0ZWQgY29uZGl0aW9uIHdoZW4gY2xvc2luZyB0aGUgc2Vzc2lvblxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU2Vzc2lvbiBcXCR7IHNlc3Npb25JZCB9IGNsb3NlZCBkdXJpbmcgd2FpdGApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBvbiBldmVudCBjbG9zZWAsIGVycm9yKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIElmIHF1ZXVlIGlzIHN0aWxsIGVtcHR5IG9yIHNlc3Npb24gaXMgaW5hY3RpdmUsIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgaWYgKHNlc3Npb24ucXVldWUubGVuZ3RoID09PSAwIHx8ICFzZXNzaW9uLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFF1ZXVlIGVtcHR5IG9yIHNlc3Npb24gaW5hY3RpdmU6ICR7c2Vzc2lvbklkfSBgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBHZXQgbmV4dCBpdGVtIGZyb20gdGhlIHNlc3Npb24ncyBxdWV1ZVxuICAgICAgICAgICAgICBjb25zdCBuZXh0RXZlbnQgPSBzZXNzaW9uLnF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgIGV2ZW50Q291bnQrKztcblxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGBTZW5kaW5nIGV2ZW50ICMkeyBldmVudENvdW50IH0gZm9yIHNlc3Npb24gJHsgc2Vzc2lvbklkIH06ICR7IEpTT04uc3RyaW5naWZ5KG5leHRFdmVudCkuc3Vic3RyaW5nKDAsIDEwMCkgfS4uLmApO1xuXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIGNodW5rOiB7XG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzOiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoSlNPTi5zdHJpbmdpZnkobmV4dEV2ZW50KSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBpbiBzZXNzaW9uICR7c2Vzc2lvbklkfSBpdGVyYXRvcjogYCwgZXJyb3IpO1xuICAgICAgICAgICAgICBzZXNzaW9uLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcmV0dXJuOiBhc3luYyAoKTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxJbnZva2VNb2RlbFdpdGhCaWRpcmVjdGlvbmFsU3RyZWFtSW5wdXQ+PiA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmF0b3IgcmV0dXJuICgpIGNhbGxlZCBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgICAgIHNlc3Npb24uaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdGhyb3c6IGFzeW5jIChlcnJvcjogYW55KTogUHJvbWlzZTxJdGVyYXRvclJlc3VsdDxJbnZva2VNb2RlbFdpdGhCaWRpcmVjdGlvbmFsU3RyZWFtSW5wdXQ+PiA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSXRlcmF0b3IgdGhyb3cgKCkgY2FsbGVkIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfSB3aXRoIGVycm9yOiBgLCBlcnJvcik7XG4gICAgICAgICAgICBzZXNzaW9uLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFByb2Nlc3MgdGhlIHJlc3BvbnNlIHN0cmVhbSBmcm9tIEFXUyBCZWRyb2NrXG4gIHByaXZhdGUgYXN5bmMgcHJvY2Vzc1Jlc3BvbnNlU3RyZWFtKHNlc3Npb25JZDogc3RyaW5nLCByZXNwb25zZTogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgZm9yIGF3YWl0IChjb25zdCBldmVudCBvZiByZXNwb25zZS5ib2R5KSB7XG4gICAgICAgIGlmICghc2Vzc2lvbi5pc0FjdGl2ZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBTZXNzaW9uICR7c2Vzc2lvbklkfSBpcyBubyBsb25nZXIgYWN0aXZlLCBzdG9wcGluZyByZXNwb25zZSBwcm9jZXNzaW5nYCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmNodW5rPy5ieXRlcykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlc3Npb25BY3Rpdml0eShzZXNzaW9uSWQpO1xuICAgICAgICAgICAgY29uc3QgdGV4dFJlc3BvbnNlID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGV2ZW50LmNodW5rLmJ5dGVzKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QganNvblJlc3BvbnNlID0gSlNPTi5wYXJzZSh0ZXh0UmVzcG9uc2UpO1xuICAgICAgICAgICAgICBpZiAoanNvblJlc3BvbnNlLmV2ZW50Py5jb250ZW50U3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoc2Vzc2lvbklkLCAnY29udGVudFN0YXJ0JywganNvblJlc3BvbnNlLmV2ZW50LmNvbnRlbnRTdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoanNvblJlc3BvbnNlLmV2ZW50Py50ZXh0T3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ3RleHRPdXRwdXQnLCBqc29uUmVzcG9uc2UuZXZlbnQudGV4dE91dHB1dCk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoanNvblJlc3BvbnNlLmV2ZW50Py5hdWRpb091dHB1dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChzZXNzaW9uSWQsICdhdWRpb091dHB1dCcsIGpzb25SZXNwb25zZS5ldmVudC5hdWRpb091dHB1dCk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoanNvblJlc3BvbnNlLmV2ZW50Py50b29sVXNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ3Rvb2xVc2UnLCBqc29uUmVzcG9uc2UuZXZlbnQudG9vbFVzZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0b29sIHVzZSBpbmZvcm1hdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgICAgICAgICBzZXNzaW9uLnRvb2xVc2VDb250ZW50ID0ganNvblJlc3BvbnNlLmV2ZW50LnRvb2xVc2U7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi50b29sVXNlSWQgPSBqc29uUmVzcG9uc2UuZXZlbnQudG9vbFVzZS50b29sVXNlSWQ7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi50b29sTmFtZSA9IGpzb25SZXNwb25zZS5ldmVudC50b29sVXNlLnRvb2xOYW1lO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGpzb25SZXNwb25zZS5ldmVudD8uY29udGVudEVuZCAmJlxuICAgICAgICAgICAgICAgIGpzb25SZXNwb25zZS5ldmVudD8uY29udGVudEVuZD8udHlwZSA9PT0gJ1RPT0wnKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBQcm9jZXNzIHRvb2wgdXNlXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFByb2Nlc3NpbmcgdG9vbCB1c2UgZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ3Rvb2xFbmQnLCB7XG4gICAgICAgICAgICAgICAgICB0b29sVXNlQ29udGVudDogc2Vzc2lvbi50b29sVXNlQ29udGVudCxcbiAgICAgICAgICAgICAgICAgIHRvb2xVc2VJZDogc2Vzc2lvbi50b29sVXNlSWQsXG4gICAgICAgICAgICAgICAgICB0b29sTmFtZTogc2Vzc2lvbi50b29sTmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYWxsaW5nIHRvb2x1c2VcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b29sIHVzZSBjb250ZW50IDogXCIsIHNlc3Npb24udG9vbFVzZUNvbnRlbnQpXG4gICAgICAgICAgICAgICAgLy8gZnVuY3Rpb24gY2FsbGluZ1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xSZXN1bHQgPSBhd2FpdCB0aGlzLnByb2Nlc3NUb29sVXNlKHNlc3Npb24udG9vbE5hbWUsIHNlc3Npb24udG9vbFVzZUNvbnRlbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2VuZCB0b29sIHJlc3VsdFxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZFRvb2xSZXN1bHQoc2Vzc2lvbklkLCBzZXNzaW9uLnRvb2xVc2VJZCwgdG9vbFJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBbHNvIGRpc3BhdGNoIGV2ZW50IGFib3V0IHRvb2wgcmVzdWx0XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ3Rvb2xSZXN1bHQnLCB7XG4gICAgICAgICAgICAgICAgICB0b29sVXNlSWQ6IHNlc3Npb24udG9vbFVzZUlkLFxuICAgICAgICAgICAgICAgICAgcmVzdWx0OiB0b29sUmVzdWx0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoanNvblJlc3BvbnNlLmV2ZW50Py5jb250ZW50RW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ2NvbnRlbnRFbmQnLCBqc29uUmVzcG9uc2UuZXZlbnQuY29udGVudEVuZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSGFuZGxlIG90aGVyIGV2ZW50c1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50S2V5cyA9IE9iamVjdC5rZXlzKGpzb25SZXNwb25zZS5ldmVudCB8fCB7fSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEV2ZW50IGtleXMgZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9OiBgLCBldmVudEtleXMpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEhhbmRsaW5nIG90aGVyIGV2ZW50c2ApXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50S2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoc2Vzc2lvbklkLCBldmVudEtleXNbMF0sIGpzb25SZXNwb25zZS5ldmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChPYmplY3Qua2V5cyhqc29uUmVzcG9uc2UpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChzZXNzaW9uSWQsICd1bmtub3duJywganNvblJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFJhdyB0ZXh0IHJlc3BvbnNlIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfShwYXJzZSBlcnJvcik6IGAsIHRleHRSZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgcHJvY2Vzc2luZyByZXNwb25zZSBjaHVuayBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH06IGAsIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5tb2RlbFN0cmVhbUVycm9yRXhjZXB0aW9uKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgTW9kZWwgc3RyZWFtIGVycm9yIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfTogYCwgZXZlbnQubW9kZWxTdHJlYW1FcnJvckV4Y2VwdGlvbik7XG4gICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ2Vycm9yJywge1xuICAgICAgICAgICAgdHlwZTogJ21vZGVsU3RyZWFtRXJyb3JFeGNlcHRpb24nLFxuICAgICAgICAgICAgZGV0YWlsczogZXZlbnQubW9kZWxTdHJlYW1FcnJvckV4Y2VwdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmludGVybmFsU2VydmVyRXhjZXB0aW9uKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgSW50ZXJuYWwgc2VydmVyIGVycm9yIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfTogYCwgZXZlbnQuaW50ZXJuYWxTZXJ2ZXJFeGNlcHRpb24pO1xuICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChzZXNzaW9uSWQsICdlcnJvcicsIHtcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlcm5hbFNlcnZlckV4Y2VwdGlvbicsXG4gICAgICAgICAgICBkZXRhaWxzOiBldmVudC5pbnRlcm5hbFNlcnZlckV4Y2VwdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBSZXNwb25zZSBzdHJlYW0gcHJvY2Vzc2luZyBjb21wbGV0ZSBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH1gKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChzZXNzaW9uSWQsICdzdHJlYW1Db21wbGV0ZScsIHtcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pO1xuXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIHByb2Nlc3NpbmcgcmVzcG9uc2Ugc3RyZWFtIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfTogYCwgZXJyb3IpO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KHNlc3Npb25JZCwgJ2Vycm9yJywge1xuICAgICAgICBzb3VyY2U6ICdyZXNwb25zZVN0cmVhbScsXG4gICAgICAgIG1lc3NhZ2U6ICdFcnJvciBwcm9jZXNzaW5nIHJlc3BvbnNlIHN0cmVhbScsXG4gICAgICAgIGRldGFpbHM6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFuIGV2ZW50IHRvIGEgc2Vzc2lvbidzIHF1ZXVlXG4gIHByaXZhdGUgYWRkRXZlbnRUb1Nlc3Npb25RdWV1ZShzZXNzaW9uSWQ6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmICghc2Vzc2lvbiB8fCAhc2Vzc2lvbi5pc0FjdGl2ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy51cGRhdGVTZXNzaW9uQWN0aXZpdHkoc2Vzc2lvbklkKTtcbiAgICBzZXNzaW9uLnF1ZXVlLnB1c2goZXZlbnQpO1xuICAgIHNlc3Npb24ucXVldWVTaWduYWwubmV4dCgpO1xuICB9XG5cblxuICAvLyBTZXQgdXAgaW5pdGlhbCBldmVudHMgZm9yIGEgc2Vzc2lvblxuICBwcml2YXRlIHNldHVwU2Vzc2lvblN0YXJ0RXZlbnQoc2Vzc2lvbklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zb2xlLmxvZyhgU2V0dGluZyB1cCBpbml0aWFsIGV2ZW50cyBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH0uLi5gKTtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICBpZiAoIXNlc3Npb24pIHJldHVybjtcblxuICAgIC8vIFNlc3Npb24gc3RhcnQgZXZlbnRcbiAgICB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICBzZXNzaW9uU3RhcnQ6IHtcbiAgICAgICAgICBpbmZlcmVuY2VDb25maWd1cmF0aW9uOiBzZXNzaW9uLmluZmVyZW5jZUNvbmZpZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcHVibGljIHNldHVwUHJvbXB0U3RhcnRFdmVudChzZXNzaW9uSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnNvbGUubG9nKGBTZXR0aW5nIHVwIHByb21wdCBzdGFydCBldmVudCBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH0uLi5gKTtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICBpZiAoIXNlc3Npb24pIHJldHVybjtcbiAgICAvLyBQcm9tcHQgc3RhcnQgZXZlbnRcbiAgICB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICBwcm9tcHRTdGFydDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICB0ZXh0T3V0cHV0Q29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbWVkaWFUeXBlOiBcInRleHQvcGxhaW5cIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGF1ZGlvT3V0cHV0Q29uZmlndXJhdGlvbjogRGVmYXVsdEF1ZGlvT3V0cHV0Q29uZmlndXJhdGlvbixcbiAgICAgICAgICB0b29sVXNlT3V0cHV0Q29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbWVkaWFUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRvb2xDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICB0b29sczogW3tcbiAgICAgICAgICAgICAgdG9vbFNwZWM6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImdldERhdGVBbmRUaW1lVG9vbFwiLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBkYXRlIGFuZCB0aW1lLlwiLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICBqc29uOiBEZWZhdWx0VG9vbFNjaGVtYVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdG9vbFNwZWM6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImdldFdlYXRoZXJUb29sXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiR2V0IHRoZSBjdXJyZW50IHdlYXRoZXIgZm9yIGEgZ2l2ZW4gbG9jYXRpb24sIGJhc2VkIG9uIGl0cyBXR1M4NCBjb29yZGluYXRlcy5cIixcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAganNvbjogV2VhdGhlclRvb2xTY2hlbWFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0pO1xuICAgIHNlc3Npb24uaXNQcm9tcHRTdGFydFNlbnQgPSB0cnVlO1xuICB9XG5cbiAgcHVibGljIHNldHVwU3lzdGVtUHJvbXB0RXZlbnQoc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgdGV4dENvbmZpZzogdHlwZW9mIERlZmF1bHRUZXh0Q29uZmlndXJhdGlvbiA9IERlZmF1bHRUZXh0Q29uZmlndXJhdGlvbixcbiAgICBzeXN0ZW1Qcm9tcHRDb250ZW50OiBzdHJpbmcgPSBEZWZhdWx0U3lzdGVtUHJvbXB0XG4gICk6IHZvaWQge1xuICAgIGNvbnNvbGUubG9nKGBTZXR0aW5nIHVwIHN5c3RlbVByb21wdCBldmVudHMgZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9Li4uYCk7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uKSByZXR1cm47XG4gICAgLy8gVGV4dCBjb250ZW50IHN0YXJ0XG4gICAgY29uc3QgdGV4dFByb21wdElEID0gcmFuZG9tVVVJRCgpO1xuICAgIHRoaXMuYWRkRXZlbnRUb1Nlc3Npb25RdWV1ZShzZXNzaW9uSWQsIHtcbiAgICAgIGV2ZW50OiB7XG4gICAgICAgIGNvbnRlbnRTdGFydDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICBjb250ZW50TmFtZTogdGV4dFByb21wdElELFxuICAgICAgICAgIHR5cGU6IFwiVEVYVFwiLFxuICAgICAgICAgIGludGVyYWN0aXZlOiB0cnVlLFxuICAgICAgICAgIHJvbGU6IFwiU1lTVEVNXCIsXG4gICAgICAgICAgdGV4dElucHV0Q29uZmlndXJhdGlvbjogdGV4dENvbmZpZyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRleHQgaW5wdXQgY29udGVudFxuICAgIHRoaXMuYWRkRXZlbnRUb1Nlc3Npb25RdWV1ZShzZXNzaW9uSWQsIHtcbiAgICAgIGV2ZW50OiB7XG4gICAgICAgIHRleHRJbnB1dDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICBjb250ZW50TmFtZTogdGV4dFByb21wdElELFxuICAgICAgICAgIGNvbnRlbnQ6IHN5c3RlbVByb21wdENvbnRlbnQsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUZXh0IGNvbnRlbnQgZW5kXG4gICAgdGhpcy5hZGRFdmVudFRvU2Vzc2lvblF1ZXVlKHNlc3Npb25JZCwge1xuICAgICAgZXZlbnQ6IHtcbiAgICAgICAgY29udGVudEVuZDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICBjb250ZW50TmFtZTogdGV4dFByb21wdElELFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHNldHVwU3RhcnRBdWRpb0V2ZW50KFxuICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgIGF1ZGlvQ29uZmlnOiB0eXBlb2YgRGVmYXVsdEF1ZGlvSW5wdXRDb25maWd1cmF0aW9uID0gRGVmYXVsdEF1ZGlvSW5wdXRDb25maWd1cmF0aW9uXG4gICk6IHZvaWQge1xuICAgIGNvbnNvbGUubG9nKGBTZXR0aW5nIHVwIHN0YXJ0QXVkaW9Db250ZW50IGV2ZW50IGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfS4uLmApO1xuICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmICghc2Vzc2lvbikgcmV0dXJuO1xuXG4gICAgY29uc29sZS5sb2coYFVzaW5nIGF1ZGlvIGNvbnRlbnQgSUQ6ICR7c2Vzc2lvbi5hdWRpb0NvbnRlbnRJZH1gKTtcbiAgICAvLyBBdWRpbyBjb250ZW50IHN0YXJ0XG4gICAgdGhpcy5hZGRFdmVudFRvU2Vzc2lvblF1ZXVlKHNlc3Npb25JZCwge1xuICAgICAgZXZlbnQ6IHtcbiAgICAgICAgY29udGVudFN0YXJ0OiB7XG4gICAgICAgICAgcHJvbXB0TmFtZTogc2Vzc2lvbi5wcm9tcHROYW1lLFxuICAgICAgICAgIGNvbnRlbnROYW1lOiBzZXNzaW9uLmF1ZGlvQ29udGVudElkLFxuICAgICAgICAgIHR5cGU6IFwiQVVESU9cIixcbiAgICAgICAgICBpbnRlcmFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICByb2xlOiBcIlVTRVJcIixcbiAgICAgICAgICBhdWRpb0lucHV0Q29uZmlndXJhdGlvbjogYXVkaW9Db25maWcsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSk7XG4gICAgc2Vzc2lvbi5pc0F1ZGlvQ29udGVudFN0YXJ0U2VudCA9IHRydWU7XG4gICAgY29uc29sZS5sb2coYEluaXRpYWwgZXZlbnRzIHNldHVwIGNvbXBsZXRlIGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfWApO1xuICB9XG5cbiAgLy8gU3RyZWFtIGFuIGF1ZGlvIGNodW5rIGZvciBhIHNlc3Npb25cbiAgcHVibGljIGFzeW5jIHN0cmVhbUF1ZGlvQ2h1bmsoc2Vzc2lvbklkOiBzdHJpbmcsIGF1ZGlvRGF0YTogQnVmZmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLmlzQWN0aXZlIHx8ICFzZXNzaW9uLmF1ZGlvQ29udGVudElkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2Vzc2lvbiAke3Nlc3Npb25JZH0gZm9yIGF1ZGlvIHN0cmVhbWluZ2ApO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IGF1ZGlvIHRvIGJhc2U2NFxuICAgIGNvbnN0IGJhc2U2NERhdGEgPSBhdWRpb0RhdGEudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuXG4gICAgdGhpcy5hZGRFdmVudFRvU2Vzc2lvblF1ZXVlKHNlc3Npb25JZCwge1xuICAgICAgZXZlbnQ6IHtcbiAgICAgICAgYXVkaW9JbnB1dDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICBjb250ZW50TmFtZTogc2Vzc2lvbi5hdWRpb0NvbnRlbnRJZCxcbiAgICAgICAgICBjb250ZW50OiBiYXNlNjREYXRhLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvLyBTZW5kIHRvb2wgcmVzdWx0IGJhY2sgdG8gdGhlIG1vZGVsXG4gIHByaXZhdGUgYXN5bmMgc2VuZFRvb2xSZXN1bHQoc2Vzc2lvbklkOiBzdHJpbmcsIHRvb2xVc2VJZDogc3RyaW5nLCByZXN1bHQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGNvbnNvbGUubG9nKFwiaW5zaWRlIHRvb2wgcmVzdWx0XCIpXG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLmlzQWN0aXZlKSByZXR1cm47XG5cbiAgICBjb25zb2xlLmxvZyhgU2VuZGluZyB0b29sIHJlc3VsdCBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH0sIHRvb2wgdXNlIElEOiAke3Rvb2xVc2VJZH1gKTtcbiAgICBjb25zdCBjb250ZW50SWQgPSByYW5kb21VVUlEKCk7XG5cbiAgICAvLyBUb29sIGNvbnRlbnQgc3RhcnRcbiAgICB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICBjb250ZW50U3RhcnQ6IHtcbiAgICAgICAgICBwcm9tcHROYW1lOiBzZXNzaW9uLnByb21wdE5hbWUsXG4gICAgICAgICAgY29udGVudE5hbWU6IGNvbnRlbnRJZCxcbiAgICAgICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgdHlwZTogXCJUT09MXCIsXG4gICAgICAgICAgcm9sZTogXCJUT09MXCIsXG4gICAgICAgICAgdG9vbFJlc3VsdElucHV0Q29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgdG9vbFVzZUlkOiB0b29sVXNlSWQsXG4gICAgICAgICAgICB0eXBlOiBcIlRFWFRcIixcbiAgICAgICAgICAgIHRleHRJbnB1dENvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgbWVkaWFUeXBlOiBcInRleHQvcGxhaW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVG9vbCBjb250ZW50IGlucHV0XG4gICAgY29uc3QgcmVzdWx0Q29udGVudCA9IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnID8gcmVzdWx0IDogSlNPTi5zdHJpbmdpZnkocmVzdWx0KTtcbiAgICB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICB0b29sUmVzdWx0OiB7XG4gICAgICAgICAgcHJvbXB0TmFtZTogc2Vzc2lvbi5wcm9tcHROYW1lLFxuICAgICAgICAgIGNvbnRlbnROYW1lOiBjb250ZW50SWQsXG4gICAgICAgICAgY29udGVudDogcmVzdWx0Q29udGVudFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUb29sIGNvbnRlbnQgZW5kXG4gICAgdGhpcy5hZGRFdmVudFRvU2Vzc2lvblF1ZXVlKHNlc3Npb25JZCwge1xuICAgICAgZXZlbnQ6IHtcbiAgICAgICAgY29udGVudEVuZDoge1xuICAgICAgICAgIHByb21wdE5hbWU6IHNlc3Npb24ucHJvbXB0TmFtZSxcbiAgICAgICAgICBjb250ZW50TmFtZTogY29udGVudElkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGBUb29sIHJlc3VsdCBzZW50IGZvciBzZXNzaW9uICR7c2Vzc2lvbklkfWApO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHNlbmRDb250ZW50RW5kKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLmlzQXVkaW9Db250ZW50U3RhcnRTZW50KSByZXR1cm47XG5cbiAgICBhd2FpdCB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICBjb250ZW50RW5kOiB7XG4gICAgICAgICAgcHJvbXB0TmFtZTogc2Vzc2lvbi5wcm9tcHROYW1lLFxuICAgICAgICAgIGNvbnRlbnROYW1lOiBzZXNzaW9uLmF1ZGlvQ29udGVudElkLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYWl0IHRvIGVuc3VyZSBpdCdzIHByb2Nlc3NlZFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA1MDApKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzZW5kUHJvbXB0RW5kKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uIHx8ICFzZXNzaW9uLmlzUHJvbXB0U3RhcnRTZW50KSByZXR1cm47XG5cbiAgICBhd2FpdCB0aGlzLmFkZEV2ZW50VG9TZXNzaW9uUXVldWUoc2Vzc2lvbklkLCB7XG4gICAgICBldmVudDoge1xuICAgICAgICBwcm9tcHRFbmQ6IHtcbiAgICAgICAgICBwcm9tcHROYW1lOiBzZXNzaW9uLnByb21wdE5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2FpdCB0byBlbnN1cmUgaXQncyBwcm9jZXNzZWRcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMzAwKSk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2VuZFNlc3Npb25FbmQoc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgICBpZiAoIXNlc3Npb24pIHJldHVybjtcblxuICAgIGF3YWl0IHRoaXMuYWRkRXZlbnRUb1Nlc3Npb25RdWV1ZShzZXNzaW9uSWQsIHtcbiAgICAgIGV2ZW50OiB7XG4gICAgICAgIHNlc3Npb25FbmQ6IHt9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYWl0IHRvIGVuc3VyZSBpdCdzIHByb2Nlc3NlZFxuICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAzMDApKTtcblxuICAgIC8vIE5vdyBpdCdzIHNhZmUgdG8gY2xlYW4gdXBcbiAgICBzZXNzaW9uLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgc2Vzc2lvbi5jbG9zZVNpZ25hbC5uZXh0KCk7XG4gICAgc2Vzc2lvbi5jbG9zZVNpZ25hbC5jb21wbGV0ZSgpO1xuICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgdGhpcy5zZXNzaW9uTGFzdEFjdGl2aXR5LmRlbGV0ZShzZXNzaW9uSWQpO1xuICAgIGNvbnNvbGUubG9nKGBTZXNzaW9uICR7c2Vzc2lvbklkfSBjbG9zZWQgYW5kIHJlbW92ZWQgZnJvbSBhY3RpdmUgc2Vzc2lvbnNgKTtcbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGEgc2Vzc2lvblxuICBwdWJsaWMgcmVnaXN0ZXJFdmVudEhhbmRsZXIoc2Vzc2lvbklkOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nLCBoYW5kbGVyOiAoZGF0YTogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gJHtzZXNzaW9uSWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgICBzZXNzaW9uLnJlc3BvbnNlSGFuZGxlcnMuc2V0KGV2ZW50VHlwZSwgaGFuZGxlcik7XG4gIH1cblxuICAvLyBEaXNwYXRjaCBhbiBldmVudCB0byByZWdpc3RlcmVkIGhhbmRsZXJzXG4gIHByaXZhdGUgZGlzcGF0Y2hFdmVudChzZXNzaW9uSWQ6IHN0cmluZywgZXZlbnRUeXBlOiBzdHJpbmcsIGRhdGE6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmICghc2Vzc2lvbikgcmV0dXJuO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IHNlc3Npb24ucmVzcG9uc2VIYW5kbGVycy5nZXQoZXZlbnRUeXBlKTtcbiAgICBpZiAoaGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaGFuZGxlcihkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gJHtldmVudFR5cGV9IGhhbmRsZXIgZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9OmAsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFsc28gZGlzcGF0Y2ggdG8gXCJhbnlcIiBoYW5kbGVyc1xuICAgIGNvbnN0IGFueUhhbmRsZXIgPSBzZXNzaW9uLnJlc3BvbnNlSGFuZGxlcnMuZ2V0KCdhbnknKTtcbiAgICBpZiAoYW55SGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYW55SGFuZGxlcih7IHR5cGU6IGV2ZW50VHlwZSwgZGF0YSB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgaW4gJ2FueScgaGFuZGxlciBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH06YCwgZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLnNlc3Npb25DbGVhbnVwSW5Qcm9ncmVzcy5oYXMoc2Vzc2lvbklkKSkge1xuICAgICAgY29uc29sZS5sb2coYENsZWFudXAgYWxyZWFkeSBpbiBwcm9ncmVzcyBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH0sIHNraXBwaW5nYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2Vzc2lvbkNsZWFudXBJblByb2dyZXNzLmFkZChzZXNzaW9uSWQpO1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZyhgU3RhcnRpbmcgY2xvc2UgcHJvY2VzcyBmb3Igc2Vzc2lvbiAke3Nlc3Npb25JZH1gKTtcbiAgICAgIGF3YWl0IHRoaXMuc2VuZENvbnRlbnRFbmQoc2Vzc2lvbklkKTtcbiAgICAgIGF3YWl0IHRoaXMuc2VuZFByb21wdEVuZChzZXNzaW9uSWQpO1xuICAgICAgYXdhaXQgdGhpcy5zZW5kU2Vzc2lvbkVuZChzZXNzaW9uSWQpO1xuICAgICAgY29uc29sZS5sb2coYFNlc3Npb24gJHtzZXNzaW9uSWR9IGNsZWFudXAgY29tcGxldGVgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgZHVyaW5nIGNsb3Npbmcgc2VxdWVuY2UgZm9yIHNlc3Npb24gJHtzZXNzaW9uSWR9OmAsIGVycm9yKTtcblxuICAgICAgLy8gRW5zdXJlIGNsZWFudXAgaGFwcGVucyBldmVuIGlmIHRoZXJlJ3MgYW4gZXJyb3JcbiAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgICAgaWYgKHNlc3Npb24pIHtcbiAgICAgICAgc2Vzc2lvbi5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLnNlc3Npb25MYXN0QWN0aXZpdHkuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIEFsd2F5cyBjbGVhbiB1cCB0aGUgdHJhY2tpbmcgc2V0XG4gICAgICB0aGlzLnNlc3Npb25DbGVhbnVwSW5Qcm9ncmVzcy5kZWxldGUoc2Vzc2lvbklkKTtcbiAgICB9XG4gIH1cblxuICAvLyBTYW1lIGZvciBmb3JjZUNsb3NlU2Vzc2lvbjpcbiAgcHVibGljIGZvcmNlQ2xvc2VTZXNzaW9uKHNlc3Npb25JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2Vzc2lvbkNsZWFudXBJblByb2dyZXNzLmhhcyhzZXNzaW9uSWQpIHx8ICF0aGlzLmFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uSWQpKSB7XG4gICAgICBjb25zb2xlLmxvZyhgU2Vzc2lvbiAke3Nlc3Npb25JZH0gYWxyZWFkeSBiZWluZyBjbGVhbmVkIHVwIG9yIG5vdCBhY3RpdmVgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlc3Npb25DbGVhbnVwSW5Qcm9ncmVzcy5hZGQoc2Vzc2lvbklkKTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gICAgICBpZiAoIXNlc3Npb24pIHJldHVybjtcblxuICAgICAgY29uc29sZS5sb2coYEZvcmNlIGNsb3Npbmcgc2Vzc2lvbiAke3Nlc3Npb25JZH1gKTtcblxuICAgICAgLy8gSW1tZWRpYXRlbHkgbWFyayBhcyBpbmFjdGl2ZSBhbmQgY2xlYW4gdXAgcmVzb3VyY2VzXG4gICAgICBzZXNzaW9uLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICBzZXNzaW9uLmNsb3NlU2lnbmFsLm5leHQoKTtcbiAgICAgIHNlc3Npb24uY2xvc2VTaWduYWwuY29tcGxldGUoKTtcbiAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgICB0aGlzLnNlc3Npb25MYXN0QWN0aXZpdHkuZGVsZXRlKHNlc3Npb25JZCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGBTZXNzaW9uICR7c2Vzc2lvbklkfSBmb3JjZSBjbG9zZWRgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5zZXNzaW9uQ2xlYW51cEluUHJvZ3Jlc3MuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgfVxuICB9XG5cbn0iXX0=