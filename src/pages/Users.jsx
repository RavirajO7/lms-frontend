import React, { useEffect, useState } from 'react'
import API from '../api/api'
import Header from '../components/Header'
import Spinner from '../components/ui/Spinner'

const ROLES = ['SUPER_ADMIN','BRANCH_ADMIN','TEACHER','STUDENT']

export default function Users() {

  const [list, setList] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [openPopup, setOpenPopup] = useState(false)

  const [formData, setFormData] = useState({
    name:'',
    email:'',
    password:'',
    role:'',
    branch:''
  })

  useEffect(() => {
    fetchUsers()
    fetchBranches()
  }, [])

  async function fetchUsers(){
    setLoading(true)
    try{
      const res = await API.get('/users/all')
      setList(res.data)
    }catch(e){ console.log(e) }
    setLoading(false)
  }

  async function fetchBranches(){
    try{
      const res = await API.get('/branches/all')
      setBranches(res.data)
    }catch(e){ console.log(e) }
  }

  async function createUser(){
    setLoading(true)
    try{
      await API.post('/auth/register', formData)
      fetchUsers()
      setOpenPopup(false)
      setFormData({name:'',email:'',password:'',role:'',branch:''})
    }catch(e){console.log(e)}
    setLoading(false)
  }

  return (
    <>
      <Header/>

      <div className="container mx-auto p-4">

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={()=> setOpenPopup(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Create User
          </button>
        </div>

        {loading && <Spinner/>}

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Branch</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u=>(
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.branch || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {openPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[450px] p-6 relative shadow-xl">

              {/* Close */}
              <button
                onClick={()=> setOpenPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-3">Create New User</h2>

              <div className="space-y-3">
                <input className="w-full border rounded px-3 py-2"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e=>setFormData({...formData,name:e.target.value})}/>
                
                <input className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e=>setFormData({...formData,email:e.target.value})}/>

                <input className="w-full border rounded px-3 py-2"
                  placeholder="Password"
                  type="password"
                  value={formData.password}
                  onChange={e=>setFormData({...formData,password:e.target.value})}/>

                {/* Role Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.role}
                  onChange={e=>setFormData({...formData,role:e.target.value})}
                >
                  <option value="">Select Role</option>
                  {ROLES.map(r=> <option key={r}>{r}</option>)}
                </select>

                {/* Branch Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.branch}
                  onChange={e=>setFormData({...formData,branch:e.target.value})}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b=> (
                    <option value={b._id} key={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={createUser}
                className="w-full bg-black text-white mt-4 py-2 rounded"
              >
                Create User
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
