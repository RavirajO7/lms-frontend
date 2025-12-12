import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import API from "../api/api";
import Spinner from "../components/ui/Spinner";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("");

  const [search, setSearch] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);
  const [passwordPopupOpen, setPasswordPopupOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    branch: "",
    assignments: []
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const userBranchId = user.branch;

  // ================= LOAD BRANCHES ==================
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

  // =============== LOAD TEACHERS, CLASSES, SECTIONS ===============
  useEffect(() => {
    if (selectedBranch) {
      fetchTeachers();
      fetchClasses();
      fetchSections();
    }
  }, [selectedBranch]);

  async function fetchTeachers() {
    const res = await API.get("/teachers/all");
    setTeachers(res.data.filter(t => t.branch?._id === selectedBranch));
  }

  async function fetchClasses() {
    const res = await API.get(`/classes/branch/${selectedBranch}`);
    setClasses(res.data);
  }

  async function fetchSections() {
    const res = await API.get("/sections/all");
    setSections(res.data.filter(s => s.branch?._id === selectedBranch));
  }

  // ===================== POPUPS ======================
  function openCreate() {
    setPopupOpen(true);
    setEditMode(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      branch: selectedBranch,
      assignments: []
    });
  }

  function openEdit(t) {
    setPopupOpen(true);
    setEditMode(true);
    setCurrentId(t._id);

    setFormData({
      name: t.name,
      email: t.email,
      phone: t.phone,
      password: "",
      branch: selectedBranch,
      assignments: t.assignments.map(a => ({
        class: a.class?._id,
        sections: a.sections.map(s => s._id)
      }))
    });
  }

  function openChangePassword(id) {
    setPasswordPopupOpen(true);
    setCurrentId(id);
    setNewPassword("");
  }

  // =================== TOGGLE CLASS ===================
  function toggleClass(classId) {
    const found = formData.assignments.find(a => a.class === classId);

    if (found) {
      setFormData({
        ...formData,
        assignments: formData.assignments.filter(a => a.class !== classId)
      });
    } else {
      setFormData({
        ...formData,
        assignments: [...formData.assignments, { class: classId, sections: [] }]
      });
    }
  }

  // =============== TOGGLE SECTION =====================
  function toggleSection(classId, sectionId) {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => {
        if (a.class !== classId) return a;

        const exists = a.sections.includes(sectionId);

        return {
          ...a,
          sections: exists
            ? a.sections.filter(s => s !== sectionId)
            : [...a.sections, sectionId]
        };
      })
    }));
  }

  // ================= SAVE TEACHER =====================
  async function save() {
    if (!formData.name || !formData.email) return alert("Fill all required fields");

    if (editMode) {
      await API.put(`/teachers/update/${currentId}`, formData);
    } else {
      if (!formData.password) return alert("Password is required");
      await API.post("/teachers/create", formData);
    }

    setPopupOpen(false);
    fetchTeachers();
  }

  // =============== DELETE TEACHER =====================
  async function deleteTeacher(id) {
    if (!window.confirm("Are you sure?")) return;
    await API.delete(`/teachers/delete/${id}`);
    fetchTeachers();
  }

  // =============== CHANGE PASSWORD ====================
  async function savePassword() {
    if (newPassword.length < 4) return alert("Password too short");

    await API.put(`/teachers/change-password/${currentId}`, {
      password: newPassword
    });

    alert("Password updated");
    setPasswordPopupOpen(false);
  }

  // =============== FILTER ====================
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="max-w-6xl mx-auto p-6 container">

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="shadow bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-bold">{filteredTeachers.length}</div>
            <div className="text-gray-600 text-sm">Teachers</div>
          </div>

          <div className="shadow bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-bold">
              {filteredTeachers.reduce((sum, t) => sum + t.assignments.length, 0)}
            </div>
            <div className="text-gray-600 text-sm">Assigned Classes</div>
          </div>
        </div>

        {/* SEARCH + BRANCH FILTER */}
        <div className="flex justify-between mb-5">
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
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded mb-6"
        >
          + Add Teacher
        </button>

        {/* ================= TEACHERS TABLE ================= */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Class & Sections</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(t => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">

                    {/* NAME */}
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>

                    {/* EMAIL */}
                    <td className="px-4 py-3 text-gray-700">{t.email}</td>

                    {/* PHONE */}
                    <td className="px-4 py-3 text-gray-700">{t.phone || "-"}</td>

                    {/* CLASS + SECTIONS (CORRECT FORMAT) */}
                    <td className="px-4 py-3 text-gray-800 text-sm leading-6">
                      {t.assignments.length === 0 && (
                        <span className="text-gray-500">No Class Assigned</span>
                      )}

                      {t.assignments.map((a, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-semibold text-gray-900">
                            {a.class?.name}:
                          </span>{" "}
                          <span className="text-gray-700">
                            {a.sections.map(s => s.name).join(", ") || "-"}
                          </span>
                        </div>
                      ))}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td className="px-4 py-3 flex justify-center gap-2">

                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </button>

                      <button
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => openChangePassword(t._id)}
                      >
                        Password
                      </button>

                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => deleteTeacher(t._id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE/EDIT POPUP */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[440px] p-6 rounded-xl shadow relative">

            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setPopupOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Teacher" : "Create Teacher"}</h2>

            <input
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Full Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded mb-3"
              placeholder="Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />

            {!editMode && (
              <input
                className="w-full border px-3 py-2 rounded mb-3"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            )}

            {/* SUPERADMIN SELECT BRANCH */}
            {isSuperAdmin && (
              <select
                className="w-full border px-3 py-2 rounded mb-4"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            )}

            {/* ASSIGN CLASSES/SECTIONS */}
            <h3 className="font-semibold mb-2">Assign Classes & Sections</h3>

            <div className="border rounded p-3 max-h-56 overflow-y-auto mb-4">
              {classes.map(cls => {
                const assigned = formData.assignments.find(a => a.class === cls._id);
                return (
                  <div key={cls._id} className="mb-3 border-b pb-2">
                    <label className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={!!assigned}
                        onChange={() => toggleClass(cls._id)}
                      />
                      <span className="font-medium">{cls.name}</span>
                    </label>

                    {assigned && (
                      <div className="ml-6 space-y-1">
                        {sections.filter(s => s.class?._id === cls._id).map(sec => (
                          <label key={sec._id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={assigned.sections.includes(sec._id)}
                              onChange={() => toggleSection(cls._id, sec._id)}
                            />
                            {sec.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="bg-black text-white w-full py-2 rounded"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD POPUP */}
      {passwordPopupOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white w-[350px] p-6 rounded-xl shadow relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              onClick={() => setPasswordPopupOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <input
              type="password"
              className="border w-full px-3 py-2 rounded mb-4"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />

            <button
              className="bg-black text-white w-full py-2 rounded"
              onClick={savePassword}
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </>
  );
}
