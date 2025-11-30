import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'

export default function TeacherPanel(){
  const [plans,setPlans]=useState([])
  useEffect(()=>{ fetch() },[])
  async function fetch(){ try{ const res = await API.get('/syllabus'); setPlans(res.data) }catch(e){ console.error(e) } }
  async function markComplete(itemId){
    try{ await API.put('/syllabus/item/'+itemId, { status: 'completed', completionPercentage:100 }); fetch(); }catch(e){ console.error(e) }
  }
  return (
    <>
      <Header />
      <div className='container'>
        <h3>Teacher Panel</h3>
        <p className='small'>Here teachers can see assigned classes and update syllabus items.</p>
        {plans.map(p=> (
          <div key={p._id} className='card' style={{marginTop:10}}>
            <h4>{p.subject} — {p.month}/{p.year}</h4>
            <ul>
              { (p.syllabusItems||[]).map(it=>(
                <li key={it._id}>{it.title} — {it.status} 
                  {it.status!=='completed' && <button style={{marginLeft:8}} className='btn' onClick={()=>markComplete(it._id)}>Mark Complete</button>}
                </li>
              )) }
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}
