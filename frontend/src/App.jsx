import React from 'react'
// import SendOtp from './components/Auth/SendOTP'
// import Product from './components/Dashboard/Product'
import { Routes, Route } from 'react-router-dom'
import DomainChecker from './components/domains/DomainChecker'
import DomainList from './components/domains/DomainList'
import DNSManager from './components/domains/DNSManager'
import ARecordUpdater from './components/domains/ARecordUpdater'

const App = () => {
  return (
    <div>
      Hey there!
      {/* <Product/> */}
      <Routes>
            <Route path="/" element={<DomainChecker />} />
            <Route path="/domains" element={<DomainList />} />
            <Route path="/dns" element={<DNSManager />} />
            <Route path="/dns/:domain" element={<ARecordUpdater />} />
      </Routes>
    </div>
  )
}

export default App