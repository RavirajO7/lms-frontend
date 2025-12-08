import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Branches from './pages/Branches'
import Classes from './pages/Classes'
import Syllabus from './pages/Syllabus'
import TeacherPanel from './pages/TeacherPanel'
import PrivateRoute from './components/PrivateRoute'
import Admins from './pages/Admins'

export default function App(){
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/branches' element={<PrivateRoute><Branches /></PrivateRoute>} />
      <Route path='/classes' element={<PrivateRoute><Classes /></PrivateRoute>} />
      <Route path='/syllabus' element={<PrivateRoute><Syllabus /></PrivateRoute>} />
      <Route path='/teacher' element={<PrivateRoute><TeacherPanel /></PrivateRoute>} />
      <Route path="/admins" element={<PrivateRoute><Admins /></PrivateRoute>} />
      <Route path='*' element={<h1 className="text-center mt-20 text-3xl">404 - Page Not Found</h1>} />
    </Routes>
  )
}
