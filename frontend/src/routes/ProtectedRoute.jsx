import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/DecodeToken.jsx'

const ProtectedRoute = ({ children }) => {
  const session = getUserFromToken()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute