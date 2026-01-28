import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
    const navigate = useNavigate();

    // 폼 상태 관리
    const [formData, setFormData] = useState({
        userId: '',
        userPwd: '',
        phone: '',
        isReceiveNotification: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 유효성 검사
    const validateForm = () => {
        const newErrors = {};

        if (!formData.userId.trim()) {
            newErrors.userId = '아이디를 입력해주세요.';
        } else if (formData.userId.length < 4 || formData.userId.length > 20) {
            newErrors.userId = '아이디는 4~20자로 입력해주세요.';
        }

        if (!formData.userPwd.trim()) {
            newErrors.userPwd = '비밀번호를 입력해주세요.';
        } else if (formData.userPwd.length < 4) {
            newErrors.userPwd = '비밀번호는 4자 이상 입력해주세요.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '전화번호를 입력해주세요.';
        } else if (!/^[0-9-]+$/.test(formData.phone)) {
            newErrors.phone = '올바른 전화번호 형식으로 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 회원가입 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/dykj/api/members/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: formData.userId,
                    userPwd: formData.userPwd,
                    phone: formData.phone,
                    isReceiveNotification: formData.isReceiveNotification ? 'Y' : 'N'
                }),
            });

            const result = await response.text();

            if (response.ok) {
                if(result === "SIGNUP_SUCCESS"){
                    alert('회원가입이 완료되었습니다!');
                    navigate('/');
                }else{
                    alert('가입 실패 : '+result);
                }
            } else {
                console.error(`서버 에러 발생! 상태코드: ${response.status}`);
                alert(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('네트워크 또는 통신 오류 발생!');
            alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 취소 버튼 핸들러
    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2 className="signup-title">회원가입</h2>

                {/* 아이디 입력 */}
                <div className="form-group">
                    <label className="form-label" htmlFor="userId">아이디</label>
                    <input
                        type="text"
                        id="userId"
                        name="userId"
                        className="form-input"
                        placeholder="아이디를 입력하세요"
                        value={formData.userId}
                        onChange={handleChange}
                    />
                    {errors.userId && <p className="error-message">{errors.userId}</p>}
                </div>

                {/* 비밀번호 입력 */}
                <div className="form-group">
                    <label className="form-label" htmlFor="userPwd">비밀번호</label>
                    <input
                        type="password"
                        id="userPwd"
                        name="userPwd"
                        className="form-input"
                        placeholder="비밀번호를 입력하세요"
                        value={formData.userPwd}
                        onChange={handleChange}
                    />
                    {errors.userPwd && <p className="error-message">{errors.userPwd}</p>}
                </div>

                {/* 전화번호 입력 */}
                <div className="form-group">
                    <label className="form-label" htmlFor="phone">전화번호</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-input"
                        placeholder="010-0000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>

                {/* 알림 수신 동의 */}
                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="isReceiveNotification"
                        name="isReceiveNotification"
                        className="checkbox-input"
                        checked={formData.isReceiveNotification}
                        onChange={handleChange}
                    />
                    <label className="checkbox-label" htmlFor="isReceiveNotification">
                        알림 수신에 동의합니다
                    </label>
                </div>

                {/* 버튼 그룹 */}
                <div className="button-group">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? '처리중...' : '회원가입'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Signup;
