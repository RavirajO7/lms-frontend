import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import API from "../api/api";
import Spinner from "../components/ui/Spinner";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(""); // CLASS or SECTION
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    class: "",
    branch: "",
  });

  const [search, setSearch] = useState("");

  // User Role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const userBranchId = user.branch;

  // ========= Load Branches ==========
  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    const res = await API.get("/branches/all");
    setBranches(res.data);

    if (!isSuperAdmin) {
      setSelectedBranch(userBranchId);
    }
  }

  // ========= Load Data ==========
  useEffect(() => {
    if (selectedBranch) {
      fetchClasses();
      fetchSections();
    }
  }, [selectedBranch]);

  async function fetchClasses() {
    setLoading(true);
    const res = await API.get(`/classes/branch/${selectedBranch}`);
    setClasses(res.data);
    setLoading(false);
  }

  async function fetchSections() {
    const res = await API.get("/sections/all");
    setSections(res.data.filter(s => s.branch?._id === selectedBranch));
  }

  // ========= SEARCH FILTER ==========
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  );

  // ========= POPUP HANDLERS ==========
  function openAddClass() {
    setPopupOpen(true);
    setPopupType("CLASS");
    setEditMode(false);
    setFormData({
      name: "",
      branch: selectedBranch || userBranchId,
    });
  }

  function openEditClass(cls) {
    setPopupOpen(true);
    setPopupType("CLASS");
    setEditMode(true);
    setCurrentId(cls._id);
    setFormData({
      name: cls.name,
      branch: selectedBranch,
    });
  }

  function openAddSection(classId) {
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(false);
    setFormData({
      name: "",
      branch: selectedBranch,
      class: classId,
    });
  }

  function openEditSection(sec) {
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(true);
    setCurrentId(sec._id);
    setFormData({
      name: sec.name,
      branch: selectedBranch,
      class: sec.class?._id,
    });
  }

  // ========= SAVE ==========
  async function save() {
    if (!formData.name.trim()) return alert("Name required");

    setLoading(true);

    if (popupType === "CLASS") {
      if (editMode) {
        await API.put(`/classes/update/${currentId}`, formData);
      } else {
        await API.post(`/classes/create`, formData);
      }
    }

    if (popupType === "SECTION") {
      if (editMode) {
        await API.put(`/sections/update/${currentId}`, formData);
      } else {
        await API.post(`/sections/create`, formData);
      }
    }

    fetchClasses();
    fetchSections();
    setPopupOpen(false);
    setLoading(false);
  }

  // ========= DELETE ==========
  async function deleteClass(id) {
    if (!window.confirm("Delete Class?")) return;
    await API.delete(`/classes/delete/${id}`);
    fetchClasses();
    fetchSections();
  }

  async function deleteSection(id) {
    if (!window.confirm("Delete Section?")) return;
    await API.delete(`/sections/delete/${id}`);
    fetchSections();
  }

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ===== Summary Cards ===== */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{filteredClasses.length}</div>
            <div className="text-gray-600 text-sm">Total Classes</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">
              {sections.filter(s => filteredClasses.some(c => c._id === s.class?._id)).length}
            </div>
            <div className="text-gray-600 text-sm">Total Sections</div>
          </div>
        </div>

        {/* ===== Search Row ===== */}
        <div className="flex justify-between mb-6">
          <input
            placeholder="Search..."
            className="border px-3 py-2 rounded w-60"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {isSuperAdmin && (
            <select
              className="border px-3 py-2 rounded"
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* ===== Always Visible Add Class Button ===== */}
        <button
          onClick={openAddClass}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded mb-6"
        >
          + Add Class
        </button>

        {/* ===== CLASS CARDS ===== */}
        {loading ? (
          <Spinner />
        ) : (
          filteredClasses.map(cls => (
            <div
              key={cls._id}
              className="border bg-white shadow rounded-xl mb-6"
            >
              {/* Class Header */}
              <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
                <div>
                  <h2 className="text-lg font-semibold">{cls.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-black text-white px-3 py-1 rounded"
                    onClick={() => openEditClass(cls)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => deleteClass(cls._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="px-5 py-3 space-y-3">
                {sections
                  .filter(s => s.class?._id === cls._id)
                  .map(sec => (
                    <div key={sec._id} className="flex justify-between border-b py-2">
                      <span className="font-medium">{sec.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => openEditSection(sec)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => deleteSection(sec._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                <button
                  onClick={() => openAddSection(cls._id)}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  + Add Section
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== POPUP ===== */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[380px] p-6 rounded-xl shadow relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setPopupOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Update" : "Create"} {popupType === "CLASS" ? "Class" : "Section"}
            </h2>

            <input
              className="border w-full px-3 py-2 rounded"
              value={formData.name}
              placeholder={popupType === "CLASS" ? "Class Name" : "Section Name"}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <button
              onClick={save}
              className="bg-black text-white w-full py-2 rounded mt-4"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
