import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    branches: 0,
    branchAdmins: 0,
    classes: 0,
    teachers: 0,
    syllabus: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const [
        branches,
        branchAdmins,
        classes,
        teachers,
        syllabus,
      ] = await Promise.all([
        API.get("/branches/all"),
        API.get("/admin/all"),
        API.get("/classes/all"),
        API.get("/teachers/all"),
        API.get("/syllabus"),
      ]);

      setStats({
        branches: branches.data.length,
        branchAdmins: branchAdmins.data.length,
        classes: classes.data.length,
        teachers: teachers.data.length,
        syllabus: syllabus.data.data.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div className="container">
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>ERP Dashboard</h2>
          <p className="small">Manage your academic system efficiently</p>
        </div>

        {/* MODULE CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <DashboardCard
            title="Branches"
            count={stats.branches}
            icon="🏢"
            loading={loading}
            onClick={() => navigate("/branches")}
          />

          <DashboardCard
            title="Branch Admins"
            count={stats.branchAdmins}
            icon="🧑‍💼"
            loading={loading}
            onClick={() => navigate("/branch-admins")}
          />

          <DashboardCard
            title="Classes"
            count={stats.classes}
            icon="🏫"
            loading={loading}
            onClick={() => navigate("/classes")}
          />

          <DashboardCard
            title="Teachers"
            count={stats.teachers}
            icon="👩‍🏫"
            loading={loading}
            onClick={() => navigate("/teachers")}
          />

          <DashboardCard
            title="Syllabus"
            count={stats.syllabus}
            icon="📘"
            loading={loading}
            onClick={() => navigate("/syllabus")}
          />
        </div>

        {/* SYSTEM FLOW */}
        <div style={{ marginTop: 30 }}>
          <h4>System Flow</h4>
          <div className="card" style={{ background: "#f8fafc" }}>
            <p className="small">
              <strong>Branches</strong> → Branch Admins → Classes → Teachers → Syllabus
            </p>
            <p className="small">
              Each branch operates independently while the Super Admin maintains
              centralized control over the entire ERP system.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- DASHBOARD CARD ---------- */

function DashboardCard({ title, count, icon, loading, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-4px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0)")
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p className="small">{title}</p>
          <h3 style={{ margin: "4px 0" }}>
            {loading ? "..." : count}
          </h3>
        </div>
        <div style={{ fontSize: 32 }}>{icon}</div>
      </div>
      <p className="small" style={{ marginTop: 8 }}>
        Manage {title.toLowerCase()}
      </p>
    </div>
  );
}
