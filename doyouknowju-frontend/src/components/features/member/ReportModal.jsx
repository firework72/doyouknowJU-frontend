import { useEffect, useState } from "react";
import { Modal } from "../../common";
import * as reportApi from "../../../api/reportApi";
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await reportApi.getReportList();
            setReports(data);
        } catch (error) {
            console.error("신고 목록을 불러오지 못했습니다.", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="신고 내역 확인"
        >
            <div className="report-modal-content">
                {loading ? (
                    <p className="loading-text">불러오는 중...</p>
                ) : reports.length > 0 ? (
                    <div className="report-list">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>신고자</th>
                                    <th>대상자</th>
                                    <th>사유</th>
                                    <th>유형</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.reportId}>
                                        <td>{formatDate(report.reportDate)}</td>
                                        <td>{report.reporterId}</td>
                                        <td>{report.targetId}</td>
                                        <td>{report.reportReason}</td>
                                        <td>{report.reportType}</td>
                                        <td>
                                            <span className={`status-badge ${report.status?.toLowerCase()}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-data">신고 내역이 없습니다.</p>
                )}
            </div>
        </Modal>
    );
};

export default ReportModal;
