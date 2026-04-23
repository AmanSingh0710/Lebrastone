import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Local storage se token check karein
    const isAuthenticated = localStorage.getItem('adminToken');

    if (!isAuthenticated) {
        // Agar token nahi hai toh login page par redirect karein
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;