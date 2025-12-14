import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import API from "../api/api";
import Spinner from "../components/ui/Spinner";

export default function Admins() {
  const [list, setList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [openPopup, setOpenPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [openPassPopup, setOpenPassPopup] = useState(false);
  const [passAdminId, setPassAdminId] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
  });

  useEffect(() => {
    fetchAdmins();
    fetchBranches();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const res = await API.get("/admin/all");
    setList(res.data);
    setLoading(false);
  }

  async function fetchBranches() {
    const res = await API.get("/branches/all");
    setBranches(res.data);
  }

  async function saveAdmin() {
    if (!formData.name || !formData.email || !formData.branch)
      return alert("Required fields missing");

    setLoading(true);
    if (editMode) {
      await API.put(`/admin/update/${currentId}`, formData);
    } else {
      await API.post("/admin/create", formData);
    }
    setOpenPopup(false);
    setEditMode(false);
    setFormData({ name: "", email: "", password: "", branch: "" });
    fetchAdmins();
    setLoading(false);
  }

  async function deleteAdmin(id) {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    await API.delete(`/admin/delete/${id}`);
    fetchAdmins();
    setLoading(false);
  }

  function openEdit(a) {
    setEditMode(true);
    setCurrentId(a._id);
    setFormData({
      name: a.name,
      email: a.email,
      password: "",
      branch: a.branch?._id || "",
    });
    setOpenPopup(true);
  }

  function openCreate() {
    setEditMode(false);
    setCurrentId(null);
    setFormData({ name: "", email: "", password: "", branch: "" });
    setOpenPopup(true);
  }

  function openPasswordPopup(a) {
    setPassAdminId(a._id);
    setPassword("");
    setConfirmPassword("");
    setOpenPassPopup(true);
  }

  async function changePassword() {
    if (!password || !confirmPassword) return alert("Both fields required");
    if (password !== confirmPassword) return alert("Passwords must match");

    setLoading(true);
    await API.put(`/admin/update-password/${passAdminId}`, { password });
    setLoading(false);
    setOpenPassPopup(false);
  }

  const filtered = list.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />

      <div className="container mx-auto p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Branch Admins</h2>
            <p className="text-sm text-gray-500">
              Manage branch-level administrators
            </p>
          </div>

          <button
            onClick={openCreate}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + Create Admin
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search admin..."
          className="border px-4 py-2 rounded-lg w-72 mb-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <Spinner />}

        {/* TABLE */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 text-sm font-semibold">Name</th>
                <th className="p-3 text-sm font-semibold">Email</th>
                <th className="p-3 text-sm font-semibold">Branch</th>
                <th className="p-3 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{a.name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.branch?.name || "-"}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openPasswordPopup(a)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                      >
                        Password
                      </button>
                      <button
                        onClick={() => deleteAdmin(a._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-gray-500"
                  >
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CREATE / EDIT MODAL */}
        {openPopup && (
          <Modal
            title={editMode ? "Edit Admin" : "Create Admin"}
            onClose={() => setOpenPopup(false)}
            onSave={saveAdmin}
          >
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {!editMode && (
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            )}
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Modal>
        )}

        {/* PASSWORD MODAL */}
        {openPassPopup && (
          <Modal
            title="Change Password"
            onClose={() => setOpenPassPopup(false)}
            onSave={changePassword}
            saveLabel="Update Password"
          >
            <Input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Modal>
        )}
      </div>
    </>
  );
}

/* ================== UI HELPERS ================== */

function Modal({ title, children, onClose, onSave, saveLabel = "Save" }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[420px] p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">Fill required details</p>

        <div className="space-y-3">{children}</div>

        <button
          onClick={onSave}
          className="w-full bg-black text-white mt-5 py-2 rounded-lg hover:bg-gray-800"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
    />
  );
}
