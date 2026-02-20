import React, { useState, useEffect } from 'react';
import * as reportApi from '../../../api/reportApi';
import Badge from '../../common/Badge';
import Pagination from '../../common/Pagination';
import Modal from '../../common/Modal';
import './AdminCommon.css';
import './ReportManagement.css';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'PROCESSED'
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [banDays, setBanDays] = useState('0'); // 제재 일수

    useEffect(() => {
        fetchReports();
    }, [page, activeTab]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await reportApi.getReportList(page, 10, activeTab);
            setReports(data.reports || []);
            setTotalPages(Math.ceil(data.total / data.size));
            setPendingCount(data.pendingCount || 0);
            setProcessedCount(data.processedCount || 0);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageClick = async (reportId) => {
        try {
            const data = await reportApi.getReportById(reportId);
            setSelectedReport(data);
            setIsDetailModalOpen(true);
        } catch (error) {
            alert('신고 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleSanction = async () => {
        if (!selectedReport) return;

        try {
            // 1. 피신고자 제재 (banDays가 0이면 건너뜀)
            if (banDays !== '0') {
                await reportApi.banMember(selectedReport.targetId, parseInt(banDays));
            }

            // 2. 신고 상태 변경 (PROCESSED)
            await reportApi.updateReportStatus(selectedReport.reportId, 'PROCESSED');

            alert('처리가 완료되었습니다.');
            setIsDetailModalOpen(false);
            fetchReports(); // 목록 새로고침
        } catch (error) {
            console.error('Processing failed:', error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const translateType = (type) => {
        const types = {
            'BOARD': '게시글',
            'REPLY': '댓글',
            'CHAT': '채팅'
        };
        return types[type] || type;
    };

    const translateStatus = (status) => {
        const statuses = {
            'PENDING': '처리중',
            'PROCESSED': '처리 완료',
            'DONE': '처리 완료'
        };
        return statuses[status] || status;
    };

    return (
        <div className="report-management">
            <div className="admin-card">
                <div className="admin-card-header">
                    <h2>신고 관리</h2>
                </div>
                <div className="admin-card-body">
                    {/* 탭 메뉴 */}
                    <div className="admin-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('PENDING'); setPage(1); }}
                        >
                            처리 중인 신고
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'PROCESSED' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('PROCESSED'); setPage(1); }}
                        >
                            완료된 신고
                        </button>
                    </div>

                    <div className="admin-summary">
                        <span>처리 중인 신고 수: {pendingCount}</span>
                        <span>완료된 신고 수: {processedCount}</span>
                    </div>

                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>신고 ID</th>
                                <th>구분</th>
                                <th>신고자</th>
                                <th>피신고자</th>
                                <th>사유</th>
                                <th>날짜</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report.reportId}>
                                        <td>{report.reportId}</td>
                                        <td>{translateType(report.reportType)}</td>
                                        <td>{report.reporterId}</td>
                                        <td>{report.targetId}</td>
                                        <td>{report.reportReason}</td>
                                        <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                                        <td>
                                            <Badge variant={report.status === 'PENDING' ? 'warning' : 'success'}>
                                                {translateStatus(report.status)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <button className="manage-btn" onClick={() => handleManageClick(report.reportId)}>관리</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>신고 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="admin-table-footer">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            </div>

            {/* 신고 상세 및 제재 모달 */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="신고 상세 정보 및 제재"
            >
                {selectedReport && (
                    <div className="report-detail report-modal">
                        <div className="report-detail-section">
                            <h4 className="section-title">신고 정보</h4>
                            <div className="detail-grid">
                                <div className="detail-item"><strong>신고 ID:</strong> {selectedReport.reportId}</div>
                                <div className="detail-item"><strong>구분:</strong> {translateType(selectedReport.reportType)}</div>
                                <div className="detail-item"><strong>신고자:</strong> {selectedReport.reporterId}</div>
                                <div className="detail-item"><strong>피신고자:</strong> {selectedReport.targetId}</div>
                                <div className="detail-item"><strong>신고 날짜:</strong> {new Date(selectedReport.reportDate).toLocaleString()}</div>
                                <div className="detail-full"><strong>신고 사유:</strong> {selectedReport.reportReason}</div>
                            </div>
                        </div>

                        <div className="report-detail-section content-section">
                            <h4 className="section-title">신고 내용</h4>
                            <div className="reported-content">
                                {selectedReport.content || <span className="no-content">내용을 불러올 수 없거나 삭제된 콘텐츠입니다.</span>}
                            </div>
                        </div>

                        <div className="report-detail-section sanction-section">
                            <h4 className="section-title">제재 처리</h4>
                            <div className="sanction-controls">
                                <select
                                    className="admin-select"
                                    value={banDays}
                                    onChange={(e) => setBanDays(e.target.value)}
                                >
                                    <option value="0">제재 없음 (단순 처리)</option>
                                    <option value="3">3일 정지</option>
                                    <option value="7">7일 정지</option>
                                    <option value="30">30일 정지</option>
                                    <option value="100">100일 정지</option>
                                    <option value="9999">영구 정지</option>
                                </select>
                                <button className="sanction-btn" onClick={handleSanction}>처리 완료</button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReportManagement;
