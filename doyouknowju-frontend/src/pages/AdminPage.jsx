import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/features/admin/AdminSidebar';
import AccountManagement from '../components/features/admin/AccountManagement';
import ReportManagement from '../components/features/admin/ReportManagement';
import { useAuth } from '../hooks/AuthContext';
import './AdminPage.css';

const AdminPage = () => {
    const { user } = useAuth();

    // 관리자 권한 체크
    if (!user || user.userRole !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-page-container">
            <AdminSidebar />
            <div className="admin-content">
                <Routes>
                    <Route index element={<Navigate to="accounts" replace />} />
                    <Route path="accounts" element={<AccountManagement />} />
                    <Route path="reports" element={<ReportManagement />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;
