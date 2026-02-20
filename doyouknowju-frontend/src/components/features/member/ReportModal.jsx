import { useEffect, useState } from "react";
import { Badge, Modal } from "../../common";
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
    }

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
                                        <td>{translateType(report.reportType)}</td>
                                        <td>
                                            <Badge className={`status-badge ${report.status?.toLowerCase()}`}>
                                                {translateStatus(report.status)}
                                            </Badge>
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
