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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVhLFFBQUEsNkJBQTZCLEdBQUc7SUFDM0MsU0FBUyxFQUFFLElBQUk7SUFDZixJQUFJLEVBQUUsR0FBRztJQUNULFdBQVcsRUFBRSxHQUFHO0NBQ2pCLENBQUM7QUFFVyxRQUFBLDhCQUE4QixHQUFHO0lBQzVDLFNBQVMsRUFBRSxRQUFxQjtJQUNoQyxRQUFRLEVBQUUsUUFBUTtJQUNsQixTQUFTLEVBQUUsWUFBOEI7SUFDekMsZUFBZSxFQUFFLEtBQUs7SUFDdEIsY0FBYyxFQUFFLEVBQUU7SUFDbEIsWUFBWSxFQUFFLENBQUM7Q0FDaEIsQ0FBQztBQUVXLFFBQUEsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM5QyxNQUFNLEVBQUUsUUFBUTtJQUNoQixZQUFZLEVBQUUsRUFBRTtJQUNoQixVQUFVLEVBQUUsRUFBRTtDQUNmLENBQUMsQ0FBQztBQUVVLFFBQUEsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM5QyxNQUFNLEVBQUUsUUFBUTtJQUNoQixZQUFZLEVBQUU7UUFDWixVQUFVLEVBQUU7WUFDVixNQUFNLEVBQUUsUUFBUTtZQUNoQixhQUFhLEVBQUUsOENBQThDO1NBQzlEO1FBQ0QsV0FBVyxFQUFFO1lBQ1gsTUFBTSxFQUFFLFFBQVE7WUFDaEIsYUFBYSxFQUFFLCtDQUErQztTQUMvRDtLQUNGO0lBQ0QsVUFBVSxFQUFFLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQztDQUN0QyxDQUFDLENBQUM7QUFFVSxRQUFBLHdCQUF3QixHQUFHLEVBQUUsU0FBUyxFQUFFLFlBQTZCLEVBQUUsQ0FBQztBQUV4RSxRQUFBLG1CQUFtQixHQUFHLDZEQUE2RDtJQUM5RixvR0FBb0c7SUFDcEcsd0RBQXdELENBQUM7QUFFOUMsUUFBQSwrQkFBK0IsR0FBRztJQUM3QyxHQUFHLHNDQUE4QjtJQUNqQyxlQUFlLEVBQUUsS0FBSztJQUN0QixPQUFPLEVBQUUsU0FBUztDQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXVkaW9UeXBlLCBBdWRpb01lZGlhVHlwZSwgVGV4dE1lZGlhVHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0SW5mZXJlbmNlQ29uZmlndXJhdGlvbiA9IHtcbiAgbWF4VG9rZW5zOiAxMDI0LFxuICB0b3BQOiAwLjksXG4gIHRlbXBlcmF0dXJlOiAwLjcsXG59O1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdEF1ZGlvSW5wdXRDb25maWd1cmF0aW9uID0ge1xuICBhdWRpb1R5cGU6IFwiU1BFRUNIXCIgYXMgQXVkaW9UeXBlLFxuICBlbmNvZGluZzogXCJiYXNlNjRcIixcbiAgbWVkaWFUeXBlOiBcImF1ZGlvL2xwY21cIiBhcyBBdWRpb01lZGlhVHlwZSxcbiAgc2FtcGxlUmF0ZUhlcnR6OiAxNjAwMCxcbiAgc2FtcGxlU2l6ZUJpdHM6IDE2LFxuICBjaGFubmVsQ291bnQ6IDEsXG59O1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdFRvb2xTY2hlbWEgPSBKU09OLnN0cmluZ2lmeSh7XG4gIFwidHlwZVwiOiBcIm9iamVjdFwiLFxuICBcInByb3BlcnRpZXNcIjoge30sXG4gIFwicmVxdWlyZWRcIjogW11cbn0pO1xuXG5leHBvcnQgY29uc3QgV2VhdGhlclRvb2xTY2hlbWEgPSBKU09OLnN0cmluZ2lmeSh7XG4gIFwidHlwZVwiOiBcIm9iamVjdFwiLFxuICBcInByb3BlcnRpZXNcIjoge1xuICAgIFwibGF0aXR1ZGVcIjoge1xuICAgICAgXCJ0eXBlXCI6IFwic3RyaW5nXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiR2VvZ3JhcGhpY2FsIFdHUzg0IGxhdGl0dWRlIG9mIHRoZSBsb2NhdGlvbi5cIlxuICAgIH0sXG4gICAgXCJsb25naXR1ZGVcIjoge1xuICAgICAgXCJ0eXBlXCI6IFwic3RyaW5nXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiR2VvZ3JhcGhpY2FsIFdHUzg0IGxvbmdpdHVkZSBvZiB0aGUgbG9jYXRpb24uXCJcbiAgICB9XG4gIH0sXG4gIFwicmVxdWlyZWRcIjogW1wibGF0aXR1ZGVcIiwgXCJsb25naXR1ZGVcIl1cbn0pO1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdFRleHRDb25maWd1cmF0aW9uID0geyBtZWRpYVR5cGU6IFwidGV4dC9wbGFpblwiIGFzIFRleHRNZWRpYVR5cGUgfTtcblxuZXhwb3J0IGNvbnN0IERlZmF1bHRTeXN0ZW1Qcm9tcHQgPSBcIllvdSBhcmUgYSBmcmllbmQuIFRoZSB1c2VyIGFuZCB5b3Ugd2lsbCBlbmdhZ2UgaW4gYSBzcG9rZW4gXCIgK1xuICBcImRpYWxvZyBleGNoYW5naW5nIHRoZSB0cmFuc2NyaXB0cyBvZiBhIG5hdHVyYWwgcmVhbC10aW1lIGNvbnZlcnNhdGlvbi4gS2VlcCB5b3VyIHJlc3BvbnNlcyBzaG9ydCwgXCIgK1xuICBcImdlbmVyYWxseSB0d28gb3IgdGhyZWUgc2VudGVuY2VzIGZvciBjaGF0dHkgc2NlbmFyaW9zLlwiO1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdEF1ZGlvT3V0cHV0Q29uZmlndXJhdGlvbiA9IHtcbiAgLi4uRGVmYXVsdEF1ZGlvSW5wdXRDb25maWd1cmF0aW9uLFxuICBzYW1wbGVSYXRlSGVydHo6IDI0MDAwLFxuICB2b2ljZUlkOiBcInRpZmZhbnlcIixcbn07XG4iXX0=