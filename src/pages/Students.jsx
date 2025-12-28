import React, { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Students() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  /* ================= STATE ================= */
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [filters, setFilters] = useState({
    branch: user.branch || "",
    class: "",
    section: "",
  });

  /* ===== ADD STUDENT ===== */
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    branch: user.branch || "",
    class: "",
    section: "",
  });

  /* ===== PROGRESS ===== */
  const [progressStudent, setProgressStudent] = useState(null);
  const [month, setMonth] = useState("");
  const [syllabus, setSyllabus] = useState(null);
  const [subjects, setSubjects] = useState([]);

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    API.get("/branches/all").then(r => setBranches(r.data));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  useEffect(() => {
    if (filters.branch)
      API.get(`/classes/branch/${filters.branch}`)
        .then(r => setClasses(r.data));
  }, [filters.branch]);

  useEffect(() => {
    if (filters.class)
      API.get(`/sections/class/${filters.class}`)
        .then(r => setSections(r.data));
  }, [filters.class]);

  const fetchStudents = async () => {
    const res = await API.get("/students/all", { params: filters });
    setStudents(res.data.data);
  };

  /* ================= ADD STUDENT ================= */
  const createStudent = async () => {
    if (!form.name || !form.class || !form.section) {
      alert("All fields are required");
      return;
    }

    await API.post("/students/create", form);
    setShowAddModal(false);
    setForm({ ...form, name: "", rollNo: "" });
    fetchStudents();
  };

  /* ================= PROGRESS ================= */
  const openProgress = (student) => {
    setProgressStudent(student);
    setMonth("");
    setSyllabus(null);
    setSubjects([]);
  };

  const loadProgress = async () => {
    if (!month) {
      alert("Select month");
      return;
    }

    /* 1️⃣ LOAD SYLLABUS (GLOBAL + BRANCH FALLBACK) */
    const sRes = await API.get("/syllabus/for-student", {
      params: {
        classId: progressStudent.class._id,
        branchId: progressStudent.branch._id,
      },
    });

    if (!sRes.data?.success) {
      alert(sRes.data?.message || "No syllabus found");
      return;
    }

    const syllabusDoc = sRes.data.data;
    setSyllabus(syllabusDoc);

    /* 2️⃣ LOAD PROGRESS */
    const pRes = await API.get("/syllabus-progress/monthly", {
      params: {
        student: progressStudent._id,
        syllabus: syllabusDoc._id,
        month,
      },
    });

    /* 3️⃣ IF PROGRESS EXISTS */
    if (pRes.data?.subjects) {
      setSubjects(pRes.data.subjects);
      return;
    }

    /* 4️⃣ INITIALIZE FROM SYLLABUS */
    const monthData = syllabusDoc.months.find(
  m => m.month?.toUpperCase() === month.toUpperCase()
);

    if (!monthData) {
      alert("No subjects for selected month");
      return;
    }

    setSubjects(
      monthData.subjects.map(s => ({
        subjectName: s.subjectName,
        written: false,
        oral: false,
        rhymes: false,
        activity: false,
        feedback: "",
        status: "PENDING",
      }))
    );
  };

  const saveProgress = async () => {
    await API.post("/syllabus-progress/update", {
      student: progressStudent._id,
      syllabus: syllabus._id,
      month,
      subjects,
    });
    alert("Progress saved successfully");
  };

  /* ================= UI ================= */
  return (
    <>
      <Header />

      <div className="container mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Students</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Student
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <select
            disabled={!isSuperAdmin}
            value={filters.branch}
            onChange={(e) =>
              setFilters({ branch: e.target.value, class: "", section: "" })
            }
          >
            <option value="">Branch</option>
            {branches.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          <select
            value={filters.class}
            onChange={(e) =>
              setFilters({ ...filters, class: e.target.value, section: "" })
            }
          >
            <option value="">Class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filters.section}
            onChange={(e) =>
              setFilters({ ...filters, section: e.target.value })
            }
          >
            <option value="">Section</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* STUDENT TABLE */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Reg No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.branchStudentNo}</td>
                <td>{s.name}</td>
                <td>{s.class?.name}</td>
                <td>{s.section?.name}</td>
                <td>
                  <button
                    onClick={() => openProgress(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD STUDENT MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-5 w-[400px] rounded">
            <h3 className="font-semibold mb-3">Add Student</h3>

            <input
              placeholder="Student Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Roll No"
              value={form.rollNo}
              onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
            />

            <select
              disabled={!isSuperAdmin}
              value={form.branch}
              onChange={(e) => {
                setForm({ ...form, branch: e.target.value, class: "", section: "" });
                API.get(`/classes/branch/${e.target.value}`)
                  .then(r => setClasses(r.data));
              }}
            >
              <option value="">Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>

            <select
              value={form.class}
              onChange={(e) => {
                setForm({ ...form, class: e.target.value, section: "" });
                API.get(`/sections/class/${e.target.value}`)
                  .then(r => setSections(r.data));
              }}
            >
              <option value="">Class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            >
              <option value="">Section</option>
              {sections.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            <button
              onClick={createStudent}
              className="bg-green-600 text-white w-full py-2 rounded mt-3"
            >
              Save Student
            </button>

            <button
              onClick={() => setShowAddModal(false)}
              className="text-red-600 w-full mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= PROGRESS MODAL ================= */}
{progressStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white w-[90%] max-h-[90vh] overflow-auto p-6 rounded">
      <h3 className="font-semibold mb-3">
        Progress – {progressStudent.name}
      </h3>

      <div className="flex gap-3 mb-4">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>

        <button
          onClick={loadProgress}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Load
        </button>
      </div>

      {/* ===== OVERALL MONTHLY PROGRESS ===== */}
      {subjects.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Overall Monthly Progress</span>
            <span className="font-semibold">
              {Math.round(
                (subjects.reduce((sum, s) =>
                  sum +
                  ["written","oral","rhymes","activity"].filter(k => s[k]).length
                , 0) / (subjects.length * 4)) * 100
              )}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded">
            <div
              className={`h-3 rounded transition-all ${
                subjects.every(s =>
                  ["written","oral","rhymes","activity"].every(k => s[k])
                )
                  ? "bg-green-600"
                  : subjects.some(s =>
                      ["written","oral","rhymes","activity"].some(k => s[k])
                    )
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${Math.round(
                  (subjects.reduce((sum, s) =>
                    sum +
                    ["written","oral","rhymes","activity"].filter(k => s[k]).length
                  , 0) / (subjects.length * 4)) * 100
                )}%`
              }}
            />
          </div>
        </div>
      )}

      {syllabus && (
        <>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th>Subject</th>
                <th>Written</th>
                <th>Oral</th>
                <th>Rhymes</th>
                <th>Activity</th>
                <th>Feedback</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((s, i) => {
                const completedCount =
                  ["written","oral","rhymes","activity"].filter(k => s[k]).length;

                const percent = Math.round((completedCount / 4) * 100);
                const status =
                  percent === 100 ? "COMPLETED" :
                  percent > 0 ? "IN PROGRESS" : "PENDING";

                return (
                  <tr key={i}>
                    <td>{s.subjectName}</td>

                    {["written","oral","rhymes","activity"].map(k => (
                      <td key={k} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-500">
                            {k.toUpperCase()}
                          </span>

                          <button
                            title={s[k] ? "Completed" : "Pending"}
                            onClick={() => {
                              const copy = [...subjects];
                              copy[i][k] = !copy[i][k];
                              copy[i].status =
                                ["written","oral","rhymes","activity"].every(x => copy[i][x])
                                  ? "COMPLETED"
                                  : ["written","oral","rhymes","activity"].some(x => copy[i][x])
                                  ? "IN PROGRESS"
                                  : "PENDING";
                              setSubjects(copy);
                            }}
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                              s[k] ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow transition ${
                                s[k] ? "translate-x-5" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    ))}

                    <td>
                      <input
                        value={s.feedback}
                        onChange={(e) => {
                          const copy = [...subjects];
                          copy[i].feedback = e.target.value;
                          setSubjects(copy);
                        }}
                      />
                    </td>

                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : status === "IN PROGRESS"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status} ({percent}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button
            onClick={saveProgress}
            className="bg-green-600 text-white px-6 py-2 rounded mt-4"
          >
            Save Progress
          </button>
        </>
      )}

      <button
        onClick={() => setProgressStudent(null)}
        className="mt-4 text-red-600"
      >
        Close
      </button>
    </div>
  </div>
)}

    </>
  );
}
