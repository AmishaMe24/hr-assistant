import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">HR Assistant</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        A simple chat interface that allows users to query job and salary information
        stored in JSON files.
      </p>
      <Link
        href="/chat"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Chat
      </Link>
    </main>
  );
}