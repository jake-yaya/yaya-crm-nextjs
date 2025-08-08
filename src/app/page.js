"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard"; // redirect to internal page
    }
  }, [session]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Internal Tool</h1>
        <p className="mb-6 text-gray-600">Sign in with your Google account to continue</p>
        <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition">
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
