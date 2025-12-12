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
  const [popupType, setPopupType] = useState(""); // CLASS or SECTION
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    class: "",
    branch: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const userBranchId = user.branch;

  // Load branches
  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    const res = await API.get("/branches/all");
    setBranches(res.data);

    if (!isSuperAdmin) setSelectedBranch(userBranchId);
  }

  // Load classes & sections when branch changes
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

  // -------------------- POPUPS --------------------

  function openAddClass() {
    if (!selectedBranch) return alert("Select branch first");
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
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(false);
    setFormData({ name: "", class: classId, branch: selectedBranch });
  }

  function openEditSection(sec) {
    setPopupOpen(true);
    setPopupType("SECTION");
    setEditMode(true);
    setCurrentId(sec._id);
    setFormData({
      name: sec.name,
      class: sec.class?._id,
      branch: selectedBranch
    });
  }

  // -------------------- SAVE --------------------

  async function save() {
    if (!formData.name) return alert("Name required");

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

    setPopupOpen(false);
    fetchClasses();
    fetchSections();
    setLoading(false);
  }

  // -------------------- DELETE --------------------

  async function deleteClass(id) {
    if (!window.confirm("Delete this class?")) return;
    await API.delete(`/classes/delete/${id}`);
    fetchClasses();
    fetchSections();
  }

  async function deleteSection(id) {
    if (!window.confirm("Delete this section?")) return;
    await API.delete(`/sections/delete/${id}`);
    fetchSections();
  }

  // ----------- UI START -----------

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto p-6 container">

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white shadow rounded-xl text-center p-4">
            <div className="text-3xl font-bold">{classes.length}</div>
            <div className="text-gray-500">Total Classes</div>
          </div>
          <div className="bg-white shadow rounded-xl text-center p-4">
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
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* ADD CLASS */}
        {selectedBranch && (
          <button
            onClick={openAddClass}
            className="bg-green-600 text-white px-5 py-2 rounded mb-6"
          >
            + Create Class
          </button>
        )}

        {/* LOADING */}
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100 border-b">
                <tr>
                   <th className="px-4 py-3 text-left font-semibold text-gray-700">Serial Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Class Name</th>

                  {/* {isSuperAdmin && (
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Branch</th>
                  )} */}

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Sections Count
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Sections
                  </th>

                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {classes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isSuperAdmin ? 5 : 4}
                      className="text-center py-6 text-gray-500"
                    >
                      No classes available.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls,index) => {
                    const classSections = sections.filter(s => s.class?._id === cls._id);

                    return (
                      <tr key={cls._id} className="border-b hover:bg-gray-50">
                        {/* CLASS NAME */}
                         <td className="px-4 py-3 font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {cls.name}
                        </td>

                        {/* BRANCH NAME */}
                        {/* {isSuperAdmin && (
                          <td className="px-4 py-3 text-gray-700">
                            {cls.branch?.name}
                          </td>
                        )} */}

                        {/* SECTION COUNT */}
                        <td className="px-4 py-3 text-gray-700">
                          {classSections.length}
                        </td>

                        {/* SECTION LIST */}
                        <td className="px-4 py-3 text-gray-800 text-sm leading-6">
                          {classSections.length === 0 ? (
                            <span className="text-gray-500">No Sections</span>
                          ) : (
                            classSections.map(s => (
                              <span
                                key={s._id}
                                className="inline-block bg-gray-200 px-2 py-1 rounded mr-2 mb-1"
                              >
                                {s.name}
                              </span>
                            ))
                          )}

                          {/* ADD SECTION BUTTON */}
                          <div>
                            <button
                              onClick={() => openAddSection(cls._id)}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              + Add Section
                            </button>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-3 flex justify-center gap-2">
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => openEditClass(cls)}
                          >
                            Edit
                          </button>

                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => deleteClass(cls._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP FOR CLASS & SECTION */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow relative">

            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setPopupOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Update " : "Create "}
              {popupType === "CLASS" ? "Class" : "Section"}
            </h2>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder={popupType === "CLASS" ? "Class Name" : "Section Name"}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <button
              className="bg-black text-white w-full py-2 mt-4 rounded"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
