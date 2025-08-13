"use client";

import { signOut, useSession } from "next-auth/react";
import TotalChatsComm100BarChart from "../../components/TotalChatsBarChart";
import ChatsByAgentComm100PieChart from "../../components/ChatsByAgentCategoryChart";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4">
          <TotalChatsComm100BarChart />
          <ChatsByAgentComm100PieChart />
        </div>
      </div>
    </main>
  );
}
