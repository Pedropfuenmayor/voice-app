"use client";

import { useState, useRef, useEffect } from "react";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      // Release the audio URL to prevent memory leaks
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }

      // Stop the media recorder if it's active
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }

      // Stop and release the media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioURL, isRecording]);

  // Helper function to determine supported mime types
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/mpeg",
      "audio/wav",
      "", // Empty string is a fallback that lets the browser choose
    ];

    for (const type of types) {
      if (type === "" || MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    try {
      // Reset states
      setRecordingComplete(false);
      setAudioURL(null);
      setStatus("");
      audioChunksRef.current = [];

      // Request microphone access with explicit audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Get supported mime type
      const mimeType = getSupportedMimeType();

      // Create a MediaRecorder with options
      const options: MediaRecorderOptions = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio data received:", event.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = () => {
        console.log(
          "MediaRecorder stopped, audio chunks:",
          audioChunksRef.current.length
        );
        if (audioChunksRef.current.length === 0) {
          setStatus("No audio data was captured. Please try again.");
          return;
        }

        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        console.log("Created audio blob:", audioBlob.size, "bytes");

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordingComplete(true);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setStatus("Error recording audio. Please try again.");
        setIsRecording(false);
      };

      // Request data every 100ms to ensure we get chunks more frequently
      mediaRecorder.start(100);
      console.log("MediaRecorder started");
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setStatus(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else {
        setStatus(
          `Error accessing microphone: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping MediaRecorder");
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks in the stream to release the microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("Audio track stopped");
        });
      }
    }
  };

  const uploadRecording = async () => {
    if (!audioURL || audioChunksRef.current.length === 0) {
      setStatus("No recording to upload");
      return;
    }

    try {
      setIsUploading(true);
      setStatus("Uploading recording...");

      // Create a blob from the audio chunks with the same MIME type used for recording
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      // Create FormData and append the audio blob with appropriate file extension
      const formData = new FormData();
      const fileExtension = mimeType.includes("webm")
        ? "webm"
        : mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("mp4") || mimeType.includes("mpeg")
        ? "mp3"
        : "wav";

      formData.append("audio", audioBlob, `recording.${fileExtension}`);

      // Send to API endpoint
      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown server error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setStatus(`Upload successful: ${data.message || "Recording uploaded"}`);
    } catch (error) {
      console.error("Error uploading recording:", error);
      setStatus(
        `Error uploading recording: ${
          error instanceof Error ? error.message : "Please try again"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">Voice Recorder</h2>

      <div className="flex space-x-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-4 py-2 rounded-full ${
            isRecording
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          aria-label="Start recording"
        >
          Start Recording
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-4 py-2 rounded-full ${
            !isRecording
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          aria-label="Stop recording"
        >
          Stop Recording
        </button>
      </div>

      {isRecording && (
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <p>Recording in progress...</p>
        </div>
      )}

      {recordingComplete && audioURL && (
        <div className="w-full max-w-md">
          <p className="mb-2">Recording complete!</p>
          <audio src={audioURL} controls className="w-full" />

          <button
            onClick={uploadRecording}
            disabled={isUploading}
            className={`mt-4 px-4 py-2 rounded-full w-full ${
              isUploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            aria-label="Upload recording"
          >
            {isUploading ? "Uploading..." : "Upload Recording"}
          </button>
        </div>
      )}

      {status && (
        <div
          className={`text-sm mt-2 p-2 rounded ${
            status.includes("Error") || status.includes("failed")
              ? "bg-red-100 text-red-700 border border-red-200"
              : status.includes("successful")
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }`}
          role="status"
        >
          {status}
        </div>
      )}
    </div>
  );
}
