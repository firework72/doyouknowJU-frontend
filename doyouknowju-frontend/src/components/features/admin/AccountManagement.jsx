import React, { useState, useEffect } from 'react';
import { memberApi } from '../../../api/memberApi';
import Pagination from '../../common/Pagination';
import BanModal from './BanModal';
import './AccountManagement.css';

const AccountManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [page]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await memberApi.getMemberList(page);
            setMembers(data.members || []);
            setTotalPages(Math.ceil(data.total / data.size));
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageClick = (member) => {
        setSelectedUser(member);
        setIsBanModalOpen(true);
    };

    const handleBanSuccess = () => {
        fetchMembers();
        setIsBanModalOpen(false);
    };

    if (loading && members.length === 0) return <div>Loading...</div>;

    return (
        <div className="account-management">
            <h2>전체 계정 관리</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>아이디</th>
                        <th>전화번호</th>
                        <th>포인트</th>
                        <th>가입일</th>
                        <th>제재 기간</th>
                        <th>상태</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.userId}>
                            <td>{member.userId}</td>
                            <td>{member.phone}</td>
                            <td>{member.points.toLocaleString()}</td>
                            <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                            <td>{member.banLimitDate ? new Date(member.banLimitDate).toLocaleDateString() : '-'}</td>
                            <td>
                                <span className={`status-badge ${member.status}`}>
                                    {member.status === 'Y' ? '활동' : member.status === 'N' ? '탈퇴' : '정지'}
                                </span>
                            </td>
                            <td>
                                <button className="manage-btn" onClick={() => handleManageClick(member)}>관리</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {selectedUser && (
                <BanModal
                    isOpen={isBanModalOpen}
                    onClose={() => setIsBanModalOpen(false)}
                    userId={selectedUser.userId}
                    onSuccess={handleBanSuccess}
                />
            )}
        </div>
    );
};

export default AccountManagement;
