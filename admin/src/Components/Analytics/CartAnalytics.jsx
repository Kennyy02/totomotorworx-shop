import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { io } from "socket.io-client";
import "./CartAnalytics.css";

const socket = io("https://totomotorworx-shop-production.up.railway.app");

const CartAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("https://totomotorworx-shop-production.up.railway.app/cart-analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    socket.on("cart-updated", () => {
      console.log("🔁 Cart updated — refreshing chart...");
      fetchAnalytics();
    });

    return () => socket.off("cart-updated");
  }, []);

  return (
    <div className="analytics-wrapper">
      <h2>Most Added to Cart</h2>
      {loading ? (
        <p>Loading analytics...</p>
      ) : analyticsData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={analyticsData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="addedCount" fill="#4f46e5" name="Added to Cart Count" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available yet.</p>
      )}
    </div>
  );
};

export default CartAnalytics;
