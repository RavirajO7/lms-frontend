import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
import Spinner from '../components/ui/Spinner'

export default function Admins() {

  const [list, setList] = useState([])
  const [branches, setBranches] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Popup states
  const [openPopup, setOpenPopup] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Password Popup
  const [openPassPopup, setOpenPassPopup] = useState(false)
  const [passAdminId, setPassAdminId] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: ''
  })

  useEffect(() => {
    fetchAdmins()
    fetchBranches()
  }, [])

  async function fetchAdmins() {
    setLoading(true)
    const res = await API.get('/admin/all')
    setList(res.data)
    setLoading(false)
  }

  async function fetchBranches() {
    const res = await API.get('/branches/all')
    setBranches(res.data)
  }

  async function saveAdmin() {
    if (!formData.name || !formData.email || !formData.branch) return alert("Required fields missing")

    setLoading(true)
    if (editMode) {
      await API.put(`/admin/update/${currentId}`, formData)
    } else {
      await API.post('/admin/create', formData)
    }
    setOpenPopup(false)
    setEditMode(false)
    setFormData({ name: '', email: '', password: '', branch: '' })
    fetchAdmins()
    setLoading(false)
  }

  async function deleteAdmin(id) {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true)
    await API.delete(`/admin/delete/${id}`)
    fetchAdmins()
    setLoading(false)
  }

  function openEdit(a) {
    setEditMode(true)
    setCurrentId(a._id)
    setFormData({
      name: a.name,
      email: a.email,
      password: '',
      branch: a.branch?._id || ''
    })
    setOpenPopup(true)
  }

  function openCreate() {
    setEditMode(false)
    setCurrentId(null)
    setFormData({ name: '', email: '', password: '', branch: '' })
    setOpenPopup(true)
  }

  // PASSWORD POPUP
  function openPasswordPopup(a) {
    setPassAdminId(a._id)
    setPassword('')
    setConfirmPassword('')
    setOpenPassPopup(true)
  }

  async function changePassword() {
    if (!password || !confirmPassword) return alert("Both fields required")
    if (password !== confirmPassword) return alert("Passwords must match")

    setLoading(true)
    await API.put(`/admin/update-password/${passAdminId}`, { password })
    setLoading(false)
    setOpenPassPopup(false)
  }

  const filtered = list.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header />

      <div className="container mx-auto p-4">

        <div className="flex justify-between mb-4">
          <input
            placeholder="Search admin..."
            className="border px-3 py-2 rounded w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Create Admin
          </button>
        </div>

        {loading && <Spinner />}

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.branch?.name || '-'}</td>

                <td className="p-2 flex gap-2">

                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => openEdit(a)}>
                    Edit
                  </button>

                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={() => openPasswordPopup(a)}>
                    Change Password
                  </button>

                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleteAdmin(a._id)}>
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CRUD Popup */}
        {openPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-[420px] p-6 relative shadow-xl">

              <button
                onClick={() => setOpenPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                ✕
              </button>

              <h2 className="text-xl font-bold mb-1">
                {editMode ? "Edit Admin" : "Create Admin"}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Fill the admin details
              </p>

              <div className="space-y-3">
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />

                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />

                {!editMode &&
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                }

                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveAdmin}
                className="w-full bg-black text-white mt-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        )}

        {/* Password Popup */}
        {openPassPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-[420px] p-6 relative shadow-xl">

              <button
                onClick={() => setOpenPassPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                ✕
              </button>

              <h2 className="text-xl font-bold mb-1">Change Password</h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter new password
              </p>

              <div className="space-y-3">
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="New Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                onClick={changePassword}
                className="w-full bg-black text-white mt-4 py-2 rounded">
                Update Password
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
