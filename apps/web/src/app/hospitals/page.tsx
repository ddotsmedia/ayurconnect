'use client'

import { useState, useEffect } from 'react'
import { Button } from '@ayurconnect/ui'

interface Hospital {
  id: string
  name: string
  type: string
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  profile?: string
  contact?: string
  address?: string
  latitude?: number
  longitude?: number
  reviews: { rating: number }[]
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [district, setDistrict] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    fetchHospitals()
  }, [district, type])

  const fetchHospitals = async () => {
    const params = new URLSearchParams()
    if (district) params.append('district', district)
    if (type) params.append('type', type)
    const res = await fetch(`/api/hospitals?${params}`)
    const data = await res.json()
    setHospitals(data)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Hospitals & Wellness Centers</h1>
      
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="hospital">Hospital</option>
          <option value="clinic">Clinic</option>
          <option value="panchakarma center">Panchakarma Center</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="wellness center">Wellness Center</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{hospital.name}</h2>
            <p className="text-gray-600">{hospital.type}</p>
            <p className="text-gray-500">{hospital.district}</p>
            <div className="flex gap-2 mt-2">
              {hospital.ccimVerified && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">CCIM Verified</span>}
              {hospital.ayushCertified && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">AYUSH Certified</span>}
              {hospital.panchakarma && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Panchakarma</span>}
              {hospital.nabh && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">NABH</span>}
            </div>
            <p className="mt-2">Average Rating: {hospital.reviews.length > 0 ? (hospital.reviews.reduce((sum, r) => sum + r.rating, 0) / hospital.reviews.length).toFixed(1) : 'No reviews'}</p>
            <Button className="mt-2">View Details</Button>
          </div>
        ))}
      </div>
    </div>
  )
}