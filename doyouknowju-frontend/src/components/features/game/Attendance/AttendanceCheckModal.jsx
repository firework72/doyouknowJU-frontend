import { useEffect, useState } from "react"
import { Modal } from "../../../common";
import './AttendanceCheckModal.css';
import { attendanceApi } from "../../../../api/game/attendanceApi";

const AttendanceCheckModal = ({isOpen, onClose, user}) =>{
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    useEffect(()=>{
        if(isOpen && user) {
            fetchAttendanceHistory();
        }
    },[isOpen, user]);

    const fetchAttendanceHistory = async () => {
        try {
            const data = await attendanceApi.getHistory();
            setAttendanceHistory(data);
        } catch (error) {
            // API 내부에서 에러 로깅
        }
    };

    return(
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="출석 확인"
        >
            <div className="attendance-calendar">
                <div className="calendar-header">
                    {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
                </div>
                <div className="calendar-grid">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="calendar-weekday">{day}</div>
                    ))}
                    {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="calendar-date empty"></div>
                    ))}
                    {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const date = i + 1;
                        const month = new Date().getMonth() + 1;
                        const year = new Date().getFullYear();
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

                        const isToday = date === new Date().getDate();
                        const isAttended = attendanceHistory.includes(dateStr);

                        return (
                            <div key={date} className={`calendar-date ${isToday ? 'today' : ''} ${isAttended ? 'attended' : ''}`}>
                                <span className="date-num">{date}</span>
                                {isAttended && <div className="checked-mark">✔</div>}
                            </div>
                        );
                    })}
                </div>
                <p className="attendance-info">
                    오늘도 방문해 주셔서 감사합니다! 🎉
                </p>
            </div>
        </Modal>
    )
};

export default AttendanceCheckModal;