import React, { useEffect, useState } from "react";
import API from "../../api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  // filter state: 'all' matlab All Time, 'today' matlab Today data
  const [filter, setFilter] = useState("all"); 

  const fetchStats = async () => {
    try {
      // Backend ko query parameter bhejenge: /admin/dashboard?filter=today ya ?filter=all
      const res = await API.get(`/admin/dashboard?filter=${filter}`);

      // Labels ko dynamic kar diya filter ke status ke hisab se
      const isToday = filter === "today";

      setStats([
        { title: isToday ? "Today New Users" : "Total Users", value: res.data.totalUsers || 0, isCount: true },
        { title: isToday ? "Today Deposit" : "Total Deposit", value: res.data.totalDeposit || 0 },
        { title: isToday ? "Today Withdraw" : "Total Withdraw", value: res.data.totalWithdraw || 0 },
        { title: isToday ? "Today Earnings" : "Total Earnings", value: res.data.totalEarnings || 0 },
        { title: isToday ? "Today Commission" : "Total Commission", value: res.data.totalCommission || 0 },
        { title: isToday ? "Today Referral" : "Total Referral", value: res.data.totalReferral || 0 },
        { title: isToday ? "Today Bonus" : "Total Bonus", value: res.data.totalBonus || 0 },
        { title: isToday ? "Today Penalty" : "Total Penalty", value: res.data.totalPenalty || 0 },
        { title: "Hold Balance", value: res.data.holdBalance || 0 },
        { title: "Wallet Balance", value: res.data.walletBalance || 0 },
      ]);
    } catch (err) {
      console.log("DASHBOARD ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Jab bhi user All Time ya Today button par click karega, data turant refresh hoga
  useEffect(() => {
    fetchStats();
  }, [filter]);

  // Background auto-refresh regular chalta rahega
  useEffect(() => {
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="dashboard-container">
      {/* Top Row with Header and Toggle Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 className="heading" style={{ margin: 0 }}>Dashboard</h1>
        
        {/* Toggle Switch Container */}
        <div style={{ display: "flex", backgroundColor: "#1e293b", padding: "4px", borderRadius: "8px", border: "1px solid #334155" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: filter === "all" ? "#2563eb" : "transparent",
              color: filter === "all" ? "#ffffff" : "#94a3b8"
            }}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter("today")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: filter === "today" ? "#2563eb" : "transparent",
              color: filter === "today" ? "#ffffff" : "#94a3b8"
            }}
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card-grid">
          {stats.map((item, index) => (
            <div className="card" key={index}>
              <h3>{item.title}</h3>
              <p>
                {item.isCount ? "" : "₹"}
                {Number(item.value || 0).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
