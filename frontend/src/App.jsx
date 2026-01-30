import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Product from './components/Dashboard/Product'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Product />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App