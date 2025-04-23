// Triggered by student through API Gateway
///retrieve a specific file format from holograam, mp3 maybe, recieve it as input in the lambda, make sure tue format is allowed for transcrive. work with asma how the file will be sent.
// Trigger Transcribe Lambda, no need, trigger transcribe here. idesally from api to transcribe but we need lambda. 

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");

const lambda = require('aws-sdk/clients/lambda');

exports.handler = async (event) => {
  try {
    let audioData;
    
    // 1. Extract Audio Data: Check if the audio data is Base64-encoded.
    if (event.isBase64Encoded) {
      // Decode the Base64-encoded audio data into a binary Buffer.
      audioData = Buffer.from(event.body, 'base64');
      console.log("Audio data received as base64 and decoded to binary.");
    } else {
      // Otherwise, assume JSON with an "audioData" field (expecting a Base64-encoded string).
      let body;
      try {
        body = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid JSON format." }),
        };
      }
      if (!body.audioData) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "No audio data provided." }),
        };
      }
      // Convert the Base64 string to a Buffer.
      audioData = Buffer.from(body.audioData, 'base64');
    }
    
    // Validate audioData exists.
    if (!audioData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No audio data provided." })
      };
    }
    
    // 2. Initialize the Transcribe Streaming Client.
    const transcribeClient = new TranscribeStreamingClient({ region: process.env.AWS_REGION });
    
    // Create an async generator that yields the audio data as a streaming chunk.
    // For simplicity, we'll yield the complete buffer at once. In real applications, you may break it into smaller chunks.
    async function* audioChunkGenerator(buffer) {
      yield { AudioEvent: { AudioChunk: buffer } };
    }
    
    // 3. Create and send the StartStreamTranscriptionCommand.
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: 'en-US',                 // The language of the audio.
      MediaSampleRateHertz: 16000,            // The sample rate of the audio (must match audio).
      MediaEncoding: 'pcm',                   // Streaming transcription requires PCM encoding.
      AudioStream: audioChunkGenerator(audioData)
    });
    
    // Send the command and await the streaming response via an async iterator.
    const response = await transcribeClient.send(command);
    
    // 4. Process the Streaming Response.
    let transcriptionResult = "";
    // The response contains an async iterator with transcript events.
    for await (const transcriptEvent of response.TranscriptResultStream) {
      if (transcriptEvent.TranscriptEvent) {
        const results = transcriptEvent.TranscriptEvent.Transcript.Results;
        for (const result of results) {
          // Append finalized (non-partial) transcript results.
          if (!result.IsPartial && result.Alternatives.length > 0) {
            transcriptionResult += result.Alternatives[0].Transcript + " ";
          }
        }
      }
    }
    
    console.log("Transcription result:", transcriptionResult);
    
    // 5. Invoke the Bedrock Lambda asynchronously with the transcription result.
    await lambda.invoke({
      FunctionName: process.env.BEDROCK_LAMBDA_NAME,
      InvocationType: 'Event', 
      Payload: JSON.stringify({ transcription: transcriptionResult })
    }).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Streaming transcription complete and Bedrock Lambda invoked.",
        transcription: transcriptionResult
      })
    };
    
  } catch (error) {
    console.error("Error in streaming transcription:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error during streaming transcription", error: error.message })
    };
  }
};

  