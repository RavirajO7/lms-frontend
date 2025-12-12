import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import API from '../api/api'

export default function Dashboard(){
  const [stats,setStats]=useState({})
  useEffect(()=>{ fetchStats() },[])
  async function fetchStats(){
    try{
      const branches= await API.get('/branches/all')
      const classes = await API.get('/classes/all')
      const students = await API.get('/students')
      setStats({ branches:branches.data.length, classes: classes.data.length, students: students.data.length })
    }catch(e){ console.error(e) }
  }
  return (
    <>
      <Header />
      <div className='container'>
        <h3>Dashboard</h3>
        <div style={{display:'flex',gap:12}}>
          <div className='card'><h4>Branches</h4><p className='small'>{stats.branches||0}</p></div>
          <div className='card'><h4>Classes</h4><p className='small'>{stats.classes||0}</p></div>
          <div className='card'><h4>Students</h4><p className='small'>{stats.students||0}</p></div>
        </div>
      </div>
    </>
  )
}
