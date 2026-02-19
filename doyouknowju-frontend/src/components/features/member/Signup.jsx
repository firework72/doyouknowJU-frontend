import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { useAuth } from '../../../hooks/AuthContext';
import { Input, Button } from '../../common';

// 아이디, 비밀번호 입력 조건
// 아이디: 5~20자, 영어 소문자+숫자 허용, 숫자만 불가
const validateUserId = (id) => /^(?=.*[a-z])[a-z0-9]{5,20}$/.test(id);

// 비밀번호: 8~30자, 대소문자/숫자/특수기호 중 2종류 이상 조합, 공백 불가
const validatePassword = (pwd) =>{
    if(/\s/.test(pwd)) return false;
    if (pwd.length < 8 || pwd.length > 30) return false;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    // 대소문자, 숫자, 특수 기호 중 2개 이상 조합
    const groupCount = [hasUpper||hasLower , hasDigit, hasSpecial].filter(Boolean).length;
    return groupCount >= 2;
}

// 전화번호: 010으로 시작하는 11자리 숫자
const isPhoneValid = (phone) => /^010[0-9]{8}/.test(phone);

function Signup() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            alert("이미 로그인된 상태입니다.");
            navigate('/');
        }
    }, [user, navigate]);

    // 폼 상태 관리
    const [formData, setFormData] = useState({
        userId: '',
        userPwd: '',
        userPwdConfirm: '',
        phone: '',
        isReceiveNotification: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // 아이디 중복 확인 결과
    const [idCheckStatus, setIdCheckStatus] = useState(null);

    // 비밀번호 입력 여부
    const [pwdTouched, setPwdTouched] = useState(false);
    const [pwdConfirmTouched, setPwdConfirmTouched] = useState(false);

    // 전화번호 입력 여부
    const [phoneTouched, setPhoneTouched] = useState(false);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if(name === 'userId'){
            setIdCheckStatus(null);
        }
        if(name === 'userPwd'){
            setPwdTouched(true);
        }
        if(name === 'userPwdConfirm'){
            setPwdConfirmTouched(true);
        }
        if(name === 'phone'){
            setPhoneTouched(true);
        }

        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 아이디 중복 확인
    const handleCheckId = async() => {
        try{
            const response = await fetch(
                `http://localhost:8080/dykj/api/members/checkId?userId=${encodeURIComponent(formData.userId)}`
            );
            if(!response.ok) throw new Error('서버 오류');
            const isExists = await response.json();
            setIdCheckStatus(isExists ? 'duplicate' : 'available');
        } catch (err) {
            alert('중복 확인 중 오류가 발생했습니다.');
        }
    };

    

    // 회원가입 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/dykj/api/members/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: formData.userId,
                    userPwd: formData.userPwd,
                    phone: formData.phone,
                    isReceiveNotification: formData.isReceiveNotification ? 'Y' : 'N'
                }),
            });

            const result = await response.text();

            if (response.ok) {
                if (result === "SIGNUP_SUCCESS") {
                    alert('회원가입이 완료되었습니다!');
                    navigate('/');
                } else {
                    alert('가입 실패 : ' + result);
                }
            } else {
                console.error(`서버 에러 발생! 상태코드: ${response.status}`);
                alert('회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('네트워크 또는 통신 오류 발생!');
            alert('서버 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 취소 버튼 핸들러
    const handleCancel = () => navigate('/');

    //아이디 입력 상태
    const isUserIdFormatValid = validateUserId(formData.userId);
    const idHasInput = formData.userId.length > 0;

    let idInputClass = '';
    let idMessage = null;
    let idMessageType= ''; // 가능 여부

    if(idHasInput && !isUserIdFormatValid){
        idInputClass = 'input-error';
        idMessage = '아이디는 5~20자의 영어 소문자, 숫자만 입력 가능합니다.';
        idMessageType = 'error';
    } else if (idCheckStatus === 'available'){
        idInputClass = 'input-success';
        idMessage = '사용 가능한 아이디입니다.';
        idMessageType = 'success';
    } else if (idCheckStatus === 'duplicate'){
        idInputClass = 'input-error';
        idMessage = '이미 사용 중인 아이디입니다.';
        idMessageType = 'error';
    }

    // 비밀번호 상태
    const isPwdValid = validatePassword(formData.userPwd);
    
    let pwdInputClass = '';
    let pwdMessage = null;
    let pwdMessageType = '';

    if(pwdTouched) {
        if(!isPwdValid){
            pwdInputClass = 'input-error';
            pwdMessage = '비밀번호는 8~30자의 영어 대소문자, 특수기호, 숫자만 입력 가능합니다.';
            pwdMessageType = 'error';
        } else {
            pwdInputClass = 'input-success';
            pwdMessage = '사용가능한 비밀번호입니다.';
            pwdMessageType = 'success';
        }
    }

    // 비밀번호 확인 상태
    const isPwdMatch = formData.userPwd === formData.userPwdConfirm && formData.userPwdConfirm !== '';

    let pwdConfirmClass = '';
    let pwdConfirmMessage = null;
    let pwdConfirmMessageType = '';

    if(pwdConfirmTouched){
        if(!isPwdMatch){
            pwdConfirmClass = 'input-error';
            pwdConfirmMessage = '비밀번호와 일치하지 않습니다.';
            pwdConfirmMessageType = 'error';
        } else {
            pwdConfirmClass = 'input-success';
        }
    }

    // 전화번호 상태
    const isPhoneValidResult = isPhoneValid(formData.phone);
    let phoneInputClass = '';
    let phoneMessage = null;
    let phoneMessageType = '';

    if (phoneTouched){
        if(!isPhoneValidResult){
            phoneInputClass = 'input-error';
            phoneMessage = '010으로 시작하는 11자리 숫자를 입력해주세요';
            phoneMessageType = 'error';
        } else {
            phoneInputClass = 'input-success';
            phoneMessage = '사용 가능한 전화번호입니다.';
            phoneMessageType = 'success';
        }
    }

    // 회원가입 버튼 활성화
    const isSubmitEnabled =
        isUserIdFormatValid &&
        idCheckStatus === 'available' &&
        isPwdValid &&
        isPwdMatch &&
        isPhoneValidResult;

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2 className="signup-title">회원가입</h2>

                {/* 아이디 입력, 중복 확인 버튼 */}
                <div className="signup-field">
                    <div className="id-input-row">
                        <Input
                            label="아이디"
                            id="userId"
                            name="userId"
                            placeholder="아이디를 입력하세요"
                            value={formData.userId}
                            onChange={handleChange}
                            fullWidth
                            className={idInputClass}
                        />
                        <Button
                            type="button"
                            variant='secondary'
                            size='sm'
                            className='id-check-btn'
                            disabled={!isUserIdFormatValid}
                            onClick={handleCheckId}
                        >
                            중복 확인
                        </Button>
                    </div>
                    {idMessage && (
                        <div className="field-status">
                            <span className={idMessageType === 'success' ? 'success-message' : 'input-error-message'}>
                                {idMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* 비밀번호 입력 */}
                <div className="signup-field">
                    <Input
                        label="비밀번호"
                        type="password"
                        id="userPwd"
                        name="userPwd"
                        placeholder="비밀번호를 입력하세요"
                        value={formData.userPwd}
                        onChange={handleChange}
                        fullWidth
                        className={pwdInputClass}
                    />
                    {pwdMessage && (
                        <div className="field-status">
                            <span className={pwdMessageType === 'success' ? 'success-message' : 'input-error-message'}>
                                {pwdMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* 비밀번호 확인 입력 */}
                <div className="signup-field">
                    <Input
                        label="비밀번호 확인"
                        type="password"
                        id="userPwdConfirm"
                        name="userPwdConfirm"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.userPwdConfirm}
                        onChange={handleChange}
                        fullWidth
                        className={pwdConfirmClass}
                    />
                    {pwdConfirmMessage && (
                        <div className="field-status">
                            <span className={pwdConfirmMessageType === 'success' ? 'success-message' : 'input-error-message'}>
                                {pwdConfirmMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* 전화번호 입력 */}
                <div className="signup-field">
                    <Input
                        label="전화번호"
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="01012345678"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                        className={phoneInputClass}
                    />
                    {phoneMessage && (
                        <div className="field-status">
                            <span className={phoneMessageType === 'success' ? 'success-message' : "input-error-message"}>
                                {phoneMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* 버튼 그룹 */}
                <div className="button-group">
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={!isSubmitEnabled}
                        style={{ flex: 1 }}
                    >
                        회원가입
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                        style={{ flex: 1 }}
                    >
                        취소
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default Signup;
