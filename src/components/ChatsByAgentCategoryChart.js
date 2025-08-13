"use client";

import { useEffect, useState } from "react";
import { PieChart, ResponsiveContainer, Pie, Label, Cell, Legend } from "recharts";

export default function ChatsByAgentComm100PieChart() {
  const [startDate, setStartDate] = useState("2025/05/01");
  const [endDate, setEndDate] = useState("2025/08/03");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    setLoading(true);
    const response = await fetch("/api/comm100/chats-by-agent-and-category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        category: ["4676e160-759d-47a4-97e7-70dd37308933"],
      }),
    });

    const data = await response.json();
    console.log(data);
    setChartData(data);
    setLoading(false);
  };

  const handleDateChange = async () => {
    if (!startDate || !endDate) return;

    fetchChartData();
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  function getRandomColor() {
    // Generates a random hex color like "#a1b2c3"
    return (
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")
    );
  }

  return (
    <div className="w-full bg-white shadow rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Start Date:</label>
          <input type="date" className="border rounded px-2 py-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">End Date:</label>
          <input type="date" className="border rounded px-2 py-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button onClick={handleDateChange} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update Chart
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <ResponsiveContainer height={300}>
            <PieChart>
              <Legend verticalAlign="top" />
              <Pie data={chartData} dataKey="chats" nameKey="agent" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRandomColor()} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
