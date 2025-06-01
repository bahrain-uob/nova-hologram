"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAudioOutputConfiguration = exports.DefaultSystemPrompt = exports.DefaultTextConfiguration = exports.WeatherToolSchema = exports.DefaultToolSchema = exports.DefaultAudioInputConfiguration = exports.DefaultInferenceConfiguration = void 0;
exports.DefaultInferenceConfiguration = {
    maxTokens: 1024,
    topP: 0.9,
    temperature: 0.7,
};
exports.DefaultAudioInputConfiguration = {
    audioType: "SPEECH",
    encoding: "base64",
    mediaType: "audio/lpcm",
    sampleRateHertz: 16000,
    sampleSizeBits: 16,
    channelCount: 1,
};
exports.DefaultToolSchema = JSON.stringify({
    "type": "object",
    "properties": {},
    "required": []
});
exports.WeatherToolSchema = JSON.stringify({
    "type": "object",
    "properties": {
        "latitude": {
            "type": "string",
            "description": "Geographical WGS84 latitude of the location."
        },
        "longitude": {
            "type": "string",
            "description": "Geographical WGS84 longitude of the location."
        }
    },
    "required": ["latitude", "longitude"]
});
exports.DefaultTextConfiguration = { mediaType: "text/plain" };
exports.DefaultSystemPrompt = "You are a friend. The user and you will engage in a spoken " +
    "dialog exchanging the transcripts of a natural real-time conversation. Keep your responses short, " +
    "generally two or three sentences for chatty scenarios.";
exports.DefaultAudioOutputConfiguration = {
    ...exports.DefaultAudioInputConfiguration,
    sampleRateHertz: 24000,
    voiceId: "tiffany",
};
