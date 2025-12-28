import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    padding: "6px 10px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 500,
    color: isActive ? "#2563eb" : "#0f172a",
    background: isActive ? "#e0e7ff" : "transparent",
  });

  return (
    <div
      className="container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      {/* LOGO / TITLE */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ margin: 0 }}>School LMS</h2>
        <span
          style={{
            fontSize: 12,
            padding: "2px 6px",
            background: "#0f172a",
            color: "#fff",
            borderRadius: 4,
          }}
        >
          ERP
        </span>
      </div>

      {/* NAVIGATION */}
      <nav
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

         <NavLink to="/classes" style={linkStyle}>
          Classes
        </NavLink>

         <NavLink to="/teacher" style={linkStyle}>
          Teachers
        </NavLink>

        <NavLink to="/admins" style={linkStyle}>
          Admins
        </NavLink>

        <NavLink to="/branches" style={linkStyle}>
          Branches
        </NavLink>
       
        <NavLink to="/syllabus" style={linkStyle}>
          Syllabus
        </NavLink>
        <NavLink to="/students" style={linkStyle}>
          Students
        </NavLink>

        <button
          onClick={logout}
          className="btn"
          style={{
            marginLeft: 10,
            background: "#ef4444",
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
