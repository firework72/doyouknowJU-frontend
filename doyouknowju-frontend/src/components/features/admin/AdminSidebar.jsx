import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h3>관리자 메뉴</h3>
            </div>
            <nav className="sidebar-nav">
                <NavLink
                    to="/admin/accounts"
                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                >
                    <i className="fas fa-users"></i> 계정 관리
                </NavLink>
                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                >
                    <i className="fas fa-exclamation-triangle"></i> 신고 관리
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
