import React, { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function SyllabusProgress() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [filters, setFilters] = useState({
    branch: user.branch || "",
    class: "",
    section: "",
    student: "",
    academicYear: "",
    month: "",
  });

  const [syllabus, setSyllabus] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    API.get("/branches/all").then(r => setBranches(r.data));
  }, []);

  useEffect(() => {
    if (filters.branch)
      API.get(`/classes/branch/${filters.branch}`).then(r => setClasses(r.data));
  }, [filters.branch]);

  useEffect(() => {
    if (filters.class)
      API.get(`/sections/class/${filters.class}`).then(r => setSections(r.data));
  }, [filters.class]);

  useEffect(() => {
    if (filters.section)
      API.get("/students/all", { params: filters }).then(r =>
        setStudents(r.data.data)
      );
  }, [filters.section]);

  const loadProgress = async () => {
    const sRes = await API.get("/syllabus", {
      params: {
        class: filters.class,
        branch: filters.branch,
        academicYear: filters.academicYear,
      },
    });

    const syllabusDoc = sRes.data[0];
    setSyllabus(syllabusDoc);

    const pRes = await API.get("/syllabus-progress/monthly", {
      params: {
        student: filters.student,
        syllabus: syllabusDoc._id,
        academicYear: filters.academicYear,
        month: filters.month,
      },
    });

    if (pRes.data?.subjects) {
      setSubjects(pRes.data.subjects);
    } else {
      const monthData = syllabusDoc.months.find(
        (m) => m.month === filters.month
      );
      setSubjects(
        monthData.subjects.map((s) => ({
          subjectName: s.subjectName,
          written: false,
          oral: false,
          rhymes: false,
          activity: false,
          status: "PENDING",
        }))
      );
    }
  };

  const saveProgress = async () => {
    await API.post("/syllabus-progress/update", {
      student: filters.student,
      syllabus: syllabus._id,
      academicYear: filters.academicYear,
      month: filters.month,
      subjects,
    });
    alert("Progress saved");
  };

  return (
    <>
      <Header />
      <div className="container mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Student Syllabus Progress</h2>

        <div className="grid grid-cols-6 gap-2 mb-4">
          <select disabled={!isSuperAdmin} value={filters.branch}
            onChange={e => setFilters({ ...filters, branch: e.target.value })}>
            <option value="">Branch</option>
            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>

          <select value={filters.class}
            onChange={e => setFilters({ ...filters, class: e.target.value })}>
            <option value="">Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select value={filters.section}
            onChange={e => setFilters({ ...filters, section: e.target.value })}>
            <option value="">Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select value={filters.student}
            onChange={e => setFilters({ ...filters, student: e.target.value })}>
            <option value="">Student</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>
                {s.branchStudentNo} - {s.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Academic Year"
            value={filters.academicYear}
            onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
          />

          <select value={filters.month}
            onChange={e => setFilters({ ...filters, month: e.target.value })}>
            <option value="">Month</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <button onClick={loadProgress}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
          Load
        </button>

        {subjects.length > 0 && (
          <>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th>Subject</th>
                  <th>Written</th>
                  <th>Oral</th>
                  <th>Rhymes</th>
                  <th>Activity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={i}>
                    <td>{s.subjectName}</td>
                    {["written","oral","rhymes","activity"].map(k => (
                      <td key={k}>
                        <input
                          type="checkbox"
                          checked={s[k]}
                          onChange={() => {
                            const copy = [...subjects];
                            copy[i][k] = !copy[i][k];
                            setSubjects(copy);
                          }}
                        />
                      </td>
                    ))}
                    <td>{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={saveProgress}
              className="bg-green-600 text-white px-6 py-2 rounded mt-4">
              Save Progress
            </button>
          </>
        )}
      </div>
    </>
  );
}
