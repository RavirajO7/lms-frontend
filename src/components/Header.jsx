import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
export default function Header(){
  const navigate = useNavigate();
  const logout = ()=> { localStorage.removeItem('token'); navigate('/login'); }
  return (
    <div className='header container'>
      <h2>School LMS</h2>
      <div className='nav'>
        <Link to='/dashboard'>Dashboard</Link>
        <Link to='/admins'>Admins</Link>
        <Link to='/branches'>Branches</Link>
        <Link to='/classes'>Classes</Link>
        <Link to='/syllabus'>Syllabus</Link>
        <Link to='/teacher'>Teacher</Link>
        <button className='btn' onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
