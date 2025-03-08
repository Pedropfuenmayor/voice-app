import React, { useRef, useState, useCallback } from "react";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcripts, setTranscripts] = useState<
    Array<{ text: string; timestamp: string }>
  >([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  }, []);

  const clearRecordingData = useCallback(() => {
    chunks.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetCounter = useCallback(() => {
    setSeconds(0);
  }, []);

  const processAudio = useCallback(async (recordedBlob: Blob) => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("audio", recordedBlob, "recording.mp3");

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.fileInfo?.transcription) {
        const timestamp = new Date().toLocaleString();
        setTranscripts((prev) => [
          { text: data.fileInfo.transcription, timestamp },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      // Reset state
      setIsRecording(true);
      setSeconds(0);
      clearRecordingData();

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup recorder
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      // Setup timer
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Handle recording completion
      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/mp3" });
        processAudio(recordedBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      clearRecordingData();
    }
  };

  const stopRecording = () => {
    setIsProcessing(true);

    // Small delay to ensure all audio is captured
    setTimeout(() => {
      setIsRecording(false);
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
      // Reset the counter after stopping
      clearRecordingData();
      resetCounter();
    }, 500);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="text-5xl text-gray-800 dark:text-gray-200 font-light py-4">
        {formatTime(seconds)}
      </div>

      <div className="flex space-x-4">
        {isRecording ? (
          <button
            onClick={stopRecording}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-full ${
              isProcessing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            aria-label="Stop recording"
          >
            {isProcessing ? "Processing..." : "Stop Recording"}
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            aria-label="Start recording"
          >
            Start Recording
          </button>
        )}
      </div>

      <div className="h-10">
        {isRecording && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <p>Recording in progress...</p>
          </div>
        )}
      </div>

      {/* Display transcript history */}
      {transcripts.length > 0 && (
        <div className="w-full max-w-xl mt-2">
          <h3 className="text-xl font-semibold mb-4">Transcript History</h3>
          <div className="space-y-4">
            {transcripts.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {item.timestamp}
                </p>
                <p className="text-gray-800 dark:text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
