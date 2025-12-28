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
  const [selectedTitle,setSelectedTitle]=useState()

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

  /* ================= OPEN FROM LIST (FIXED) ================= */
  async function openFromRow(s) {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/syllabus/load", {
        params: {
          syllabusTitle: s.syllabusTitle,
          academicYear: s.academicYear,
          classId: s.class._id,
          branch: s.isGlobal ? "ALL" : s.branch?._id,
        },
      });

      const data = res.data.data;

      MONTHS.forEach(m => {
        if (!data.months.find(x => x.month === m)) {
          data.months.push({ month: m, subjects: [] });
        }
      });

      setSyllabus(data);
      setEditorOpen(true);
      setSelectorOpen(false);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to open syllabus");
    } finally {
      setLoading(false);
    }
  }

  /* ================= CREATE / OPEN ================= */
  async function openSyllabus() {
    if (!syllabusTitle || !academicYear || !classId) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.get("/syllabus/load", {
        params: { syllabusTitle, academicYear, classId, branch },
      });

      const data = res.data.data;

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
  console.log(syllabus)
  async function saveSyllabus() {
    try {
      await API.put(`/syllabus/${syllabus._id}`, {
        months: syllabus.months,
        syllabusTitle: selectedTitle,
      });
      alert("Syllabus saved");
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    }
  }

  /* ================= DELETE ================= */
  async function deleteSyllabus(id) {
    if (!window.confirm("Delete this syllabus permanently?")) return;

    try {
      await API.delete(`/syllabus/${id}`);
      alert("Syllabus deleted");
      fetchList();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
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
              + Create / Open
            </button>
          )}
        </div>

        {/* LIST */}
        <table className="w-full border mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Year</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s._id}>
                <td className="p-2 border">{s.syllabusTitle}</td>
                <td className="p-2 border">{s.academicYear}</td>
                <td className="p-2 border">{s.class?.name}</td>
                <td className="p-2 border">{s.isGlobal ? "ALL" : s.branch?.name}</td>
                <td className="p-2 border">{s.status}</td>
                <td className="p-2 border space-x-3">
                  <button
                    onClick={() => {openFromRow(s);setSelectedTitle(s.syllabusTitle)}}
                    className="text-blue-600"
                  >
                    Open
                  </button>

                  {!isTeacher && (
                    <button
                      onClick={() => deleteSyllabus(s._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SELECTOR MODAL */}
        {selectorOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded p-4">
              <h2 className="font-semibold mb-3">Create / Open Syllabus</h2>

              {error && <p className="text-red-500 mb-2">{error}</p>}

              <input
                className="w-full border p-2 mb-2"
                placeholder="Syllabus Title"
                value={syllabusTitle}
                onChange={e => setSyllabusTitle(e.target.value)}
              />

              <select
                className="w-full border p-2 mb-2"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
              >
                <option value="">Academic Year</option>
                <option value="2025-26">2025–26</option>
                <option value="2026-27">2026–27</option>
              </select>

              <select
                className="w-full border p-2 mb-2"
                value={classId}
                onChange={e => setClassId(e.target.value)}
              >
                <option value="">Class</option>
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

              <div className="flex justify-end gap-2">
                <button onClick={() => setSelectorOpen(false)}>Cancel</button>
                <button
                  onClick={openSyllabus}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  {loading ? "Loading..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDITOR */}
        {editorOpen && syllabus && (
          <div className="fixed inset-0 bg-black/40 z-50 overflow-auto">
            <div className="bg-white m-6 p-4 rounded">
              <div className="flex justify-between mb-3">
                <h2 className="font-semibold">{syllabus.syllabusTitle}</h2>
                <button onClick={() => setEditorOpen(false)}>✕</button>
              </div>

              <div className="flex gap-2 mb-3 border-b">
                {MONTHS.map(m => (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    className={activeMonth === m ? "border-b-2 border-blue-600" : ""}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Subject</th>
                    <th>Written</th>
                    <th>Oral</th>
                    <th>Rhymes</th>
                    <th>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabus.months.find(m => m.month === activeMonth)?.subjects.map((r, i) => (
                    <tr key={i}>
                      <td><input disabled={isTeacher} value={r.subjectName} onChange={e => { r.subjectName = e.target.value; setSyllabus({ ...syllabus }); }} /></td>
                      {["written","oral","rhymes","activity"].map(k => (
                        <td key={k}><textarea disabled={isTeacher} value={r[k]} onChange={e => { r[k] = e.target.value; setSyllabus({ ...syllabus }); }} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isTeacher && (
                <div className="flex justify-between mt-3">
                  <button onClick={addSubject}>+ Add Subject</button>
                  <button onClick={saveSyllabus} className="bg-blue-600 text-white px-4 py-1 rounded">
                    Save
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
