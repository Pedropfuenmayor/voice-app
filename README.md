# Voice App

A Next.js application that allows users to record audio, transcribe it using OpenAI's Whisper API, and display the transcription results.

## Features

- Real-time voice recording through browser microphone
- Audio processing and transcription using OpenAI's Whisper API

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **API Integration**: OpenAI Whisper API for speech-to-text transcription
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v18 or newer)
- OpenAI API key
  ```

  ```

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

1. The application uses the browser's MediaRecorder API to capture audio from the user's microphone
2. When recording is stopped, the audio is sent to the server as a blob
3. The server forwards the audio to OpenAI's Whisper API for transcription
4. The transcription results are returned to the client and displayed in the UI

## Project Structure

- `src/app/page.tsx`: Main application page
- `src/components/VoiceRecorder.tsx`: Core voice recording functionality
- `src/app/api/voice/route.ts`: API endpoint for processing audio and communicating with OpenAI

## UI

  <img width="1495" alt="image" src="https://github.com/user-attachments/assets/7bede578-b1b5-40c1-9d9d-73128384c400" />
  <img width="1491" alt="image" src="https://github.com/user-attachments/assets/51a36f8e-cbe5-46f8-a55e-b2e7309e94da" />
  <img width="1483" alt="image" src="https://github.com/user-attachments/assets/bb210f99-6af6-45cf-8902-897f02dd0453" />


## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
