import React, { useState } from 'react'
import API from '../api/api'
import { useNavigate } from 'react-router-dom'
export default function Login(){
  const [email,setEmail]=useState('super@school.com')
  const [password,setPassword]=useState('password')
  const [err,setErr]=useState('')
  const navigate = useNavigate()
  const submit = async ()=>{
    try{
      const res = await API.post('/auth/login',{ email,password })
      if(res.data.token){
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else setErr('Login failed');
    }catch(e){ setErr(e.response?.data?.message || e.message) }
  }
  return (
    <div className='container' style={{maxWidth:420, marginTop:60}}>
      <h3>Login</h3>
      <div>
        <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        <button className='btn' onClick={submit} style={{width:'100%'}}>Login</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </div>
    </div>
  )
}