import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
import Spinner from '../components/ui/Spinner'

export default function Sections() {
  const [list, setList] = useState([])
  const [branches, setBranches] = useState([])
  const [classes, setClasses] = useState([])

  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Popup
  const [openPopup, setOpenPopup] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    class: ''
  })

  // Logged user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {}
    } catch {
      return {}
    }
  })()

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'
  const userBranchId = currentUser?.branch || ''

  // Load data on mount
  useEffect(() => {
    fetchBranches()
    fetchSections()

    if (!isSuperAdmin && userBranchId) {
      fetchClassesByBranch(userBranchId)
      setFormData(prev => ({ ...prev, branch: userBranchId }))
    }
  }, [])

  // BRANCHES
  async function fetchBranches() {
    try {
      const res = await API.get('/branches/all')
      setBranches(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // SECTIONS
  async function fetchSections() {
    setLoading(true)
    try {
      const res = await API.get('/sections/all')
      setList(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // CLASSES BASED ON BRANCH
  async function fetchClassesByBranch(branchId) {
    if (!branchId) {
      setClasses([])
      return
    }
    try {
      const res = await API.get(`/classes/branch/${branchId}`)
      setClasses(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // Open Create
  function openCreate() {
    setEditMode(false)
    setCurrentId(null)
    setFormData({
      name: '',
      branch: isSuperAdmin ? '' : userBranchId,
      class: ''
    })

    if (!isSuperAdmin) fetchClassesByBranch(userBranchId)

    setOpenPopup(true)
  }

  // Open Edit
  function openEdit(sec) {
    setEditMode(true)
    setCurrentId(sec._id)

    const branchId = sec.branch?._id || sec.branch
    const classId = sec.class?._id || sec.class

    setFormData({
      name: sec.name,
      branch: branchId,
      class: classId
    })

    fetchClassesByBranch(branchId)
    setOpenPopup(true)
  }

  // SAVE 
  async function saveSection() {
    if (!formData.name) return alert("Section name required")
    if (!formData.branch) return alert("Branch required")
    if (!formData.class) return alert("Class required")

    setLoading(true)
    try {
      if (editMode) {
        await API.put(`/sections/update/${currentId}`, formData)
      } else {
        await API.post('/sections/create', formData)
      }

      setOpenPopup(false)
      setEditMode(false)
      setFormData({
        name: '',
        branch: isSuperAdmin ? '' : userBranchId,
        class: ''
      })
      fetchSections()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  // DELETE
  async function deleteSection(id) {
    if (!window.confirm("Are you sure?")) return
    setLoading(true)
    try {
      await API.delete(`/sections/delete/${id}`)
      fetchSections()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // Branch change (for SUPER admin only)
  function handleBranchChange(branchId) {
    setFormData(prev => ({ ...prev, branch: branchId, class: '' }))
    fetchClassesByBranch(branchId)
  }

  // Filtering
  const filtered = list.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header />

      <div className="container mx-auto p-4">

        {/* Search + Create */}
        <div className="flex justify-between mb-4">
          <input
            placeholder="Search section..."
            className="border px-3 py-2 rounded w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={openCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Create Section
          </button>
        </div>

        {loading && <Spinner />}

        {/* TABLE */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Section</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sec => (
              <tr key={sec._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{sec.name}</td>
                <td className="p-2">{sec.class?.name || '-'}</td>
                <td className="p-2">{sec.branch?.name || '-'}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => openEdit(sec)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleteSection(sec._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* POPUP FORM */}
        {openPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-[450px] p-6 relative shadow-xl">

              {/* Close */}
              <button
                onClick={() => setOpenPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-1">
                {editMode ? "Edit Section" : "Create Section"}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Fill section details.
              </p>

              <div className="space-y-3">
                {/* Section Name */}
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., A, B, C"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />

                {/* BRANCH (only visible to super admin) */}
                {isSuperAdmin ? (
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.branch}
                    onChange={e => handleBranchChange(e.target.value)}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={
                      branches.find(b => b._id === userBranchId)?.name ||
                      "Current Branch"
                    }
                    disabled
                  />
                )}

                {/* CLASS DROPDOWN */}
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.class}
                  onChange={e => setFormData({ ...formData, class: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save */}
              <button
                onClick={saveSection}
                className="w-full bg-black text-white font-medium mt-4 py-2 rounded"
              >
                Save
              </button>

              <p
                onClick={() => setOpenPopup(false)}
                className="text-center text-sm cursor-pointer text-gray-500 mt-3"
              >
                Cancel
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
