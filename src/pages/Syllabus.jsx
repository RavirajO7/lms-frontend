import { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";

const MONTHS = [
  "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER",
  "OCTOBER", "NOVEMBER", "DECEMBER", "JANUARY", "FEBRUARY", "MARCH"
];

export default function Syllabus() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isTeacher = user.role === "TEACHER";
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [syllabus, setSyllabus] = useState(null);
  const [activeMonth, setActiveMonth] = useState("APRIL");

  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);

  const [academicYear, setAcademicYear] = useState("");
  const [classId, setClassId] = useState("");
  const [syllabusTitle, setSyllabusTitle] = useState("");

  const [branch, setBranch] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchList();
    API.get("/classes/all").then(r => setClasses(r.data));
    if (isSuperAdmin) API.get("/branches/all").then(r => setBranches(r.data));
  }, []);

  async function fetchList() {
    const res = await API.get("/syllabus");
    setList(res.data.data || []);
  }

  /* ================= CREATE / OPEN ================= */
  async function openSyllabus() {
    if (!syllabusTitle) {
      setError("Syllabus title is required");
      return;
    }

    if (!academicYear || !classId) {
      setError("Academic year and class are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.get("/syllabus/load", {
        params: {
          syllabusTitle,
          academicYear,
          classId,
          branch,
        },
      });

      const data = res.data.data;

      // Ensure all months exist
      MONTHS.forEach(m => {
        if (!data.months.find(x => x.month === m)) {
          data.months.push({ month: m, subjects: [] });
        }
      });

      setSyllabus(data);
      setEditorOpen(true);
      setSelectorOpen(false);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load syllabus");
    } finally {
      setLoading(false);
    }
  }

  /* ================= SAVE ================= */
  async function saveSyllabus() {
    try {
      await API.put(`/syllabus/${syllabus._id}`, {
        months: syllabus.months,
      });
      alert("Syllabus saved successfully");
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    }
  }

  /* ================= ADD SUBJECT ================= */
  function addSubject() {
    const m = syllabus.months.find(x => x.month === activeMonth);
    m.subjects.push({
      subjectName: "",
      written: "",
      oral: "",
      rhymes: "",
      activity: "",
    });
    setSyllabus({ ...syllabus });
  }

  /* ================= UI ================= */
  return (
    <>
    <Header />
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Syllabus Management</h1>

        {!isTeacher && (
          <button
            onClick={() => setSelectorOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Create / Open Syllabus
          </button>
        )}
      </div>

      {/* ========== LISTING ========== */}
      <table className="w-full border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Year</th>
            <th className="p-2 border">Assigned Class</th>
            <th className="p-2 border">Branch</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s._id}>
              <td className="p-2 border font-medium">
                {s.syllabusTitle}
              </td>

              <td className="p-2 border">{s.academicYear}</td>
              <td className="p-2 border">{s.class?.name}</td>
              <td className="p-2 border">{s.isGlobal ? "ALL" : s.branch?.name}</td>
              <td className="p-2 border">{s.status}</td>
              <td className="p-2 border">
                <button
                  onClick={() => {
                    setAcademicYear(s.academicYear);
                    setClassId(s.class._id);
                    setBranch(s.isGlobal ? "ALL" : s.branch?._id);
                    openSyllabus();
                  }}
                  className="text-blue-600"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ========== SELECTOR MODAL ========== */}
      {selectorOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded p-4">
            <h2 className="text-lg font-semibold mb-3">Create / Open Syllabus</h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <input
              className="w-full border p-2 mb-2"
              placeholder="Syllabus Title (e.g. Nursery Syllabus 2026–27)"
              value={syllabusTitle}
              onChange={(e) => setSyllabusTitle(e.target.value)}
            />

            <select
              className="w-full border p-2 mb-2"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              <option value="2025-26">2025–26</option>
              <option value="2026-27">2026–27</option>
              <option value="2027-28">2027–28</option>
            </select>

            <select
              className="w-full border p-2 mb-2"
              value={classId}
              onChange={e => setClassId(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {isSuperAdmin && (
              <select
                className="w-full border p-2 mb-2"
                value={branch}
                onChange={e => setBranch(e.target.value)}
              >
                <option value="ALL">ALL BRANCHES</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setSelectorOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={openSyllabus}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Loading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDITOR MODAL ========== */}
      {editorOpen && syllabus && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-auto">
          <div className="bg-white m-6 p-4 rounded">
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Syllabus Editor – {syllabus.syllabusTitle}
              </h2>
              <button onClick={() => setEditorOpen(false)}>✕</button>
            </div>

            {/* Month Tabs */}
            <div className="flex gap-2 mb-3 border-b">
              {MONTHS.map(m => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className={`px-3 py-1 ${activeMonth === m
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Table */}
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">Written</th>
                  <th className="border p-2">Oral</th>
                  <th className="border p-2">Rhymes</th>
                  <th className="border p-2">Activity</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.months
                  .find(m => m.month === activeMonth)
                  ?.subjects.map((row, i) => (
                    <tr key={i}>
                      <td className="border p-1">
                        <input
                          disabled={isTeacher}
                          className="w-full border p-1"
                          value={row.subjectName}
                          onChange={e => {
                            row.subjectName = e.target.value;
                            setSyllabus({ ...syllabus });
                          }}
                        />
                      </td>
                      {["written", "oral", "rhymes", "activity"].map(k => (
                        <td key={k} className="border p-1">
                          <textarea
                            disabled={isTeacher}
                            className="w-full border p-1"
                            value={row[k]}
                            onChange={e => {
                              row[k] = e.target.value;
                              setSyllabus({ ...syllabus });
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>

            {!isTeacher && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={addSubject}
                  className="px-4 py-2 border rounded"
                >
                  + Add Subject
                </button>
                <button
                  onClick={saveSyllabus}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save Syllabus
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
