import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
export default function Branches(){
  const [list,setList]=useState([])
  const [name,setName]=useState('')
  useEffect(()=>{ fetchBranches() },[])
  async function fetchBranches(){
    try{
      const res = await API.get('/branches')
      setList(res.data)
    }catch(e){ console.error(e) }
  }
  async function createBranch(){
    if(!name) return;
    try{
      await API.post('/branches',{ name })
      setName(''); fetchBranches();
    }catch(e){ console.error(e) }
  }
  return (
    <>
      <Header />
      <div className='container'>
        <h3>Branches</h3>
        <div className='form-row'>
          <input placeholder='Branch name' value={name} onChange={e=>setName(e.target.value)} />
          <button className='btn' onClick={createBranch}>Create</button>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Address</th></tr></thead>
          <tbody>{list.map(b=> <tr key={b._id}><td>{b.name}</td><td className='small'>{b.address||'-'}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  )
}
