import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DomainChecker from './components/domains/DomainChecker'
import DomainList from './components/domains/DomainList'
import DNSManager from './components/domains/DNSManager'
import ARecordUpdater from './components/domains/ARecordUpdater'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import OrderConfirmation from './pages/OrderConfirmation'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import './index.css'

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-confirmation" 
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/domain-checker" 
          element={
            <ProtectedRoute>
              <DomainChecker />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/domains" 
          element={
            <ProtectedRoute>
              <DomainList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dns" 
          element={
            <ProtectedRoute>
              <DNSManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dns/:domain" 
          element={
            <ProtectedRoute>
              <ARecordUpdater />
            </ProtectedRoute>
          } 
        />
        
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App