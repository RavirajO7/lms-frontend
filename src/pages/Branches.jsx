import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'

export default function Branches() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')

  // Popup states
  const [openPopup, setOpenPopup] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: ''
  })

  useEffect(() => { fetchBranches() }, [])

  async function fetchBranches() {
    setLoading(true)
    try {
      const res = await API.get('/branches/all')
      setList(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // Search filter
  const filtered = list.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  // Create or Update Branch
  async function saveBranch() {
    if (!formData.name) return;
    setLoading(true)

    try {
      if (editMode) {
        await API.put(`/branches/update/${currentId}`, formData)
      } else {
        await API.post(`/branches/create`, formData)
      }

      setOpenPopup(false)
      setEditMode(false)
      setFormData({ name: '', address: '', contact: '' })
      fetchBranches()
    } catch (err) { console.error(err) }

    setLoading(false)
  }

  // Delete
  async function deleteBranch(id) {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true)
    try {
      await API.delete(`/branches/delete/${id}`)
      fetchBranches()
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // Open Edit Popup
  function editBranch(b) {
    setEditMode(true)
    setCurrentId(b._id)
    setFormData({
      name: b.name,
      address: b.address || '',
      contact: b.contact || ''
    })
    setOpenPopup(true)
  }

  // Open Create Popup
  function createPopup() {
    setEditMode(false)
    setCurrentId(null)
    setFormData({ name: '', address: '', contact: '' })
    setOpenPopup(true)
  }

  return (
    <>
      <Header />

      <div className="container mx-auto p-4">

        {/* Top Bar */}
        <div className="flex justify-between mb-4">
          <input
            placeholder="Search branch..."
            className="border px-3 py-2 rounded w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={createPopup}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Create Branch
          </button>
        </div>

        {loading && <Spinner />}

        {/* Table */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{b.name}</td>
                <td className="p-2 text-sm">{b.address || '-'}</td>
                <td className="p-2 text-sm">{b.contact || '-'}</td>

                <td className="p-2 flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => editBranch(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleteBranch(b._id)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        {openPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl w-[420px] p-6 relative shadow-xl animate-fadeIn">

              {/* Close Button */}
              <button
                onClick={() => setOpenPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              {/* Title */}
              <h2 className="text-xl font-bold mb-1">
                {editMode ? "Edit Branch" : "Create Branch"}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Fill out the form with correct branch details.
              </p>

              {/* Inputs */}
              <div className="space-y-3">
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Branch Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                  placeholder="Contact"
                  value={formData.contact}
                  onChange={e => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>

              {/* Button */}
              <button
                onClick={saveBranch}
                className="w-full bg-black text-white font-medium mt-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Save
              </button>

              {/* Cancel text */}
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
