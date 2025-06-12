import './index.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'

function App() {

  return (
    <div className='App'>
      <Routes>
      <Route path='/' element={<Navigate to ="/Login"/>} /> 
      <Route path='/login' element={<Login/>} /> 
      <Route path='/signup' element={<Signup/>} /> 
      <Route path='/home' element={<Home/>} /> 
      </Routes>
  
    </div>
  )
}

export default App
