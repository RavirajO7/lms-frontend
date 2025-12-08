import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import API from "../api/api";
import Spinner from "../components/ui/Spinner";

export default function Classes() {

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState(""); // CLASS OR SECTION
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    class: "",
    branch: "",
  });

  // Logged user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const userBranchId = user.branch;

  // ======================
  // Load Branches + Set default
  // ======================
  useEffect(() => { fetchBranches(); }, []);

  async function fetchBranches() {
    const res = await API.get("/branches/all");
    setBranches(res.data);

    if (!isSuperAdmin) {
      setSelectedBranch(userBranchId);
    }
  }

  // ======================
  // Fetch Classes + Sections
  // ======================
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

  // ======================
  // POPUP LOGIC
  // ======================
  function openAddClass() {
    if (!selectedBranch) return alert("Select branch first!");
    setPopupOpen(true);
    setPopupType("CLASS");
    setEditMode(false);
    setFormData({ name: "", branch: selectedBranch });
  }

  function openEditClass(cls) {
    setPopupOpen(true);
    setPopupType("CLASS");
    setEditMode(true);
    setCurrentId(cls._id);
    setFormData({ name: cls.name, branch: selectedBranch });
  }

  function openAddSection(classId) {
    if (!selectedBranch) return alert("Select branch first!");
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(false);
    setFormData({ name: "", branch: selectedBranch, class: classId });
  }

  function openEditSection(sec) {
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(true);
    setCurrentId(sec._id);
    setFormData({ name: sec.name, branch: selectedBranch, class: sec.class?._id });
  }

  // ======================
  // SAVE DATA
  // ======================
  async function save() {
    if (!formData.name) return alert("Name required");

    setLoading(true);

    // CLASS
    if (popupType === "CLASS") {
      if (editMode) {
        await API.put(`/classes/update/${currentId}`, formData);
      } else {
        await API.post(`/classes/create`, formData);
      }
    }

    // SECTION
    if (popupType === "SECTION") {
      if (editMode) {
        await API.put(`/sections/update/${currentId}`, formData);
      } else {
        await API.post(`/sections/create`, formData);
      }
    }

    setPopupOpen(false);
    fetchClasses();
    fetchSections();
    setLoading(false);
  }

  // ======================
  // DELETE
  // ======================
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

      <div className="max-w-6xl mx-auto p-6">

        {/* TOP DASHBOARD CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold">{classes.length}</div>
            <div className="text-gray-500">Total Classes</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl font-bold">{sections.length}</div>
            <div className="text-gray-500">Total Sections</div>
          </div>
        </div>

        {/* BRANCH SELECT */}
        {isSuperAdmin && (
          <div className="mb-5">
            <select
              className="border px-3 py-2 rounded"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* ADD CLASS BUTTON */}
        {selectedBranch && (
          <button
            onClick={openAddClass}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded mb-6"
          >
            + Create Class
          </button>
        )}

        {/* CLASS LIST */}
        {loading ? (
          <Spinner />
        ) : (
          classes.map(cls => (
            <div key={cls._id} className="bg-white border rounded-xl shadow mb-6">
              <div className="flex justify-between items-center px-5 py-3 border-b">
                <h3 className="text-lg font-semibold">{cls.name}</h3>
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
              <div className="px-5 py-3">
                {sections
                  .filter(s => s.class?._id === cls._id)
                  .map(sec => (
                    <div key={sec._id} className="flex justify-between border-b py-2">
                      <div>{sec.name}</div>
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={()=>openEditSection(sec)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded"
                          onClick={()=>deleteSection(sec._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                <button
                  onClick={() => openAddSection(cls._id)}
                  className="text-sm text-gray-600 mt-3 hover:text-black"
                >
                  + Add Section
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= POPUP ================== */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setPopupOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Update " : "Create "}
              {popupType === "CLASS" ? "Class" : "Section"}
            </h2>

            <input
              className="border w-full rounded px-3 py-2"
              placeholder={popupType === "CLASS" ? "Class Name" : "Section Name"}
              value={formData.name}
              onChange={(e)=>setFormData({...formData, name:e.target.value})}
            />

            <button
              onClick={save}
              className="bg-black hover:bg-gray-800 text-white mt-4 w-full py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
