import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
export default function Classes(){
  const [list,setList]=useState([]), [name,setName]=useState(''), [branch,setBranch]=useState('')
  useEffect(()=>{ fetch() },[])
  async function fetch(){ try{ const res=await API.get('/classes'); setList(res.data) }catch(e){ console.error(e) } }
  async function create(){ if(!name||!branch) return; try{ await API.post('/classes',{ name, branch }); setName(''); fetch(); }catch(e){ console.error(e) } }
  return (
    <>
      <Header />
      <div className='container'>
        <h3>Classes</h3>
        <div style={{display:'flex',gap:8}}>
          <input placeholder='Class name' value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder='Branch id' value={branch} onChange={e=>setBranch(e.target.value)} />
          <button className='btn' onClick={create}>Create Class</button>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Branch</th></tr></thead>
          <tbody>{list.map(c=> <tr key={c._id}><td>{c.name}</td><td className='small'>{c.branch}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  )
}
