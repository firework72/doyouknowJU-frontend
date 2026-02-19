import React, { useState, useEffect } from 'react';
import * as reportApi from '../../../api/reportApi';
import { Modal } from '../../common';
import './ReportManagement.css';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [banDays, setBanDays] = useState('0'); // 제재 일수

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await reportApi.getReportList();
            setReports(data);
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
            // 제재 처리 (사용자가 선택한 정지 일수 적용)
            // 백엔드 memberApi.banMember 재사용
            const { memberApi } = await import('../../../api/memberApi');

            // BAN_LIMIT_DATE 업데이트 (백엔드 /ban API 호출)
            if (banDays !== '0') {
                await memberApi.banMember(selectedReport.targetId, parseInt(banDays));
            }

            // 신고 상태를 'PROCESSED' 등으로 변경하는 로직이 있다면 추가 가능
            // 여기서는 일단 제재 완료 메시지만 띄움
            await reportApi.updateReportStatus(selectedReport.reportId, 'PROCESSED');

            alert('제재가 완료되었습니다.');
            setIsDetailModalOpen(false);
            fetchReports();
        } catch (error) {
            console.error('Sanction failed:', error);
            alert('제재 처리에 실패했습니다.');
        }
    };

    return (
        <div className="report-management">
            <h2>신고 관리</h2>
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
                    {reports.map(report => (
                        <tr key={report.reportId}>
                            <td>{report.reportId}</td>
                            <td>{report.reportType}</td>
                            <td>{report.reporterId}</td>
                            <td>{report.targetId}</td>
                            <td>{report.reportReason}</td>
                            <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                            <td>{report.status}</td>
                            <td>
                                <button className="manage-btn" onClick={() => handleManageClick(report.reportId)}>관리</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 신고 상세 및 제재 모달 */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="신고 상세 정보 및 제재"
            >
                {selectedReport && (
                    <div className="report-detail">
                        <div className="detail-row"><span>신고 ID:</span> {selectedReport.reportId}</div>
                        <div className="detail-row"><span>신고 타입:</span> {selectedReport.reportType}</div>
                        <div className="detail-row"><span>컨텐츠 ID:</span> {selectedReport.contentId}</div>
                        <div className="detail-row"><span>신고자:</span> {selectedReport.reporterId}</div>
                        <div className="detail-row"><span>피신고자:</span> {selectedReport.targetId}</div>
                        <div className="detail-row"><span>신고 사유:</span> {selectedReport.reportReason}</div>
                        <div className="detail-row"><span>신고 날짜:</span> {new Date(selectedReport.reportDate).toLocaleString()}</div>

                        <div className="sanction-section">
                            <h4>제재 설정</h4>
                            <div className="sanction-controls">
                                <select value={banDays} onChange={(e) => setBanDays(e.target.value)}>
                                    <option value="0">해당 없음</option>
                                    <option value="3">3일 정지</option>
                                    <option value="7">7일 정지</option>
                                    <option value="30">30일 정지</option>
                                    <option value="100">100일 정지</option>
                                    <option value="9999">영구 정지</option>
                                </select>
                                <button className="sanction-btn" onClick={handleSanction}>제재 수행</button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReportManagement;
