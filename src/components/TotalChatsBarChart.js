"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Rectangle, ComposedChart, Line } from "recharts";

export default function TotalChatsComm100BarChart() {
  const [startDate, setStartDate] = useState("2025/05/01");
  const [endDate, setEndDate] = useState("2025/08/03");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = async () => {
    setLoading(true);
    const response = await fetch("/api/comm100/total-chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate: startDate, endDate: endDate }),
    });

    const data = await response.json();
    console.log(data.series);
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
            <ComposedChart
              width={500}
              height={300}
              data={chartData.series}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis />
              <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                dot={false}
                strokeWidth={2}
                strokeLinecap="round"
                type="monotone"
                dataKey="percentageOfBotOnlyChats"
                stroke="#3B7AD9"
                yAxisId="right"
                legendType="rect"
                name="Percent of Bot only Chats"
              />
              <Bar dataKey="botOnlyChats" fill="#8884d8" name="Chatbot Only Chats" activeBar={<Rectangle fill="pink" stroke="blue" />} />
              <Bar dataKey="chatsFromBotToOnlineAgent" name="Total Chats" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
