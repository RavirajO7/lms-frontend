import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'
export default function Syllabus(){
  const [plans,setPlans]=useState([]), [classId,setClassId]=useState(''), [month,setMonth]=useState('')
  useEffect(()=>{ fetch() },[])
  async function fetch(){ try{ const res = await API.get('/syllabus'); setPlans(res.data) }catch(e){ console.error(e) } }
  async function createPlan(){
    const payload = { branch: '', class: classId, section: null, year: new Date().getFullYear(), month: Number(month||new Date().getMonth()+1), subject: 'General', syllabusItems: [{ title: 'Topic 1' }] }
    try{ await API.post('/syllabus', payload ); fetch(); }catch(e){ console.error(e) }
  }
  return (
    <>
      <Header />
      <div className='container'>
        <h3>Curriculum Plans</h3>
        <div style={{display:'flex',gap:8}}>
          <input placeholder='Class id' value={classId} onChange={e=>setClassId(e.target.value)} />
          <input placeholder='Month (1-12)' value={month} onChange={e=>setMonth(e.target.value)} />
          <button className='btn' onClick={fetch}>Filter</button>
          <button className='btn' onClick={createPlan}>Create sample plan</button>
        </div>
        <table>
          <thead><tr><th>Subject</th><th>Month</th><th>Items</th></tr></thead>
          <tbody>
            {plans.map(p=> <tr key={p._id}><td>{p.subject}</td><td>{p.month}/{p.year}</td><td>{p.syllabusItems?.length||0}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  )
}
