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
  Cell
} from "recharts";
import "./CartAnalytics.css";
import '../../Pages/Admin/AdminTheme.css';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#8b5cf6'];

const CartAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("https://totomotorworx-shop-production.up.railway.app/cart-analytics");
      const data = await response.json();
      
      // Sort by addedCount in descending order and take top 10
      const sortedData = data
        .filter(item => item.name && item.addedCount > 0)
        .sort((a, b) => b.addedCount - a.addedCount)
        .slice(0, 10);
      
      setAnalyticsData(sortedData);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">
            Added to Cart: {payload[0].value} times
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-wrapper">
      <h2>Most Added to Cart - Top Products & Services</h2>
      
      {loading ? (
        <p className="loading-text">Loading analytics...</p>
      ) : analyticsData.length > 0 ? (
        <>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={analyticsData}
              margin={{ top: 20, right: 30, left: 10, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="addedCount" name="Added to Cart Count" radius={[8, 8, 0, 0]}>
                {analyticsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {lastUpdated && (
            <p className="last-updated">Last updated: {lastUpdated}</p>
          )}
          
          <div className="analytics-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product/Service</th>
                  <th>Times Added to Cart</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((item, index) => (
                  <tr key={index}>
                    <td className="rank-cell">#{index + 1}</td>
                    <td>
                      <div className="product-cell">
                        {item.image && (
                          <img src={item.image} alt={item.name} />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="count-cell">{item.addedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </>
      ) : (
        <p className="empty-state">
          No products have been added to cart yet.
        </p>
      )}
    </div>
  );
};

export default CartAnalytics;