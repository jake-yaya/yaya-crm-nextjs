"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Rectangle } from "recharts";

export default function ChatMetricsComm100BarChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      const response = await fetch("/api/comm100/chart-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate: "2025/08/01", endDate: "2025/08/03" }),
      });

      const data = await response.json();
      console.log(data.series);
      setChartData(data);
      setLoading(false);
    };

    fetchChartData();
  }, []);

  return (
    <div className="w-full h-[400px] bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="botOnlyChats" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
              <Bar dataKey="chatsFromBotToOnlineAgent" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
