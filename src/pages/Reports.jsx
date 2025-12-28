import React, { useState } from "react";
import API from "../api/api";
import Header from "../components/Header";

export default function Reports() {
  const [student, setStudent] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);

  const loadMonthly = async () => {
    const res = await API.get("/syllabus-progress/monthly", {
      params: { student, syllabus, academicYear, month: "January" },
    });
    setMonthly(res.data?.subjects || []);
  };

  const loadYearly = async () => {
    const res = await API.get("/syllabus-progress/yearly", {
      params: { student, syllabus, academicYear },
    });
    setYearly(res.data);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Student Reports</h2>

        <button onClick={loadMonthly}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
          Load Monthly
        </button>

        <button onClick={loadYearly}
          className="bg-green-600 text-white px-4 py-2 rounded">
          Load Yearly
        </button>

        <pre className="mt-4 bg-gray-100 p-3 rounded">
          {JSON.stringify({ monthly, yearly }, null, 2)}
        </pre>
      </div>
    </>
  );
}
