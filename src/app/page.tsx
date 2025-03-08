import ClientVoiceRecorder from "@/components/ClientVoiceRecorder";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-3xl font-bold mb-4">Voice App</h1>

        {/* Voice Recorder Component */}
        <div className="w-full max-w-md">
          <ClientVoiceRecorder />
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Record your voice and upload it to the server.
          </p>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Voice App
        </p>
      </footer>
    </div>
  );
}
