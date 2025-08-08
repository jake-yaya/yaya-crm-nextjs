"use client";

import { signOut, useSession } from "next-auth/react";
import ChatMetricsComm100BarChart from "../../components/ChatsMetricsBarChart";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="mb-4">Welcome, {session?.user?.name}</p>
        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sign out
        </button>
        <ChatMetricsComm100BarChart />
      </div>
    </main>
  );
}
