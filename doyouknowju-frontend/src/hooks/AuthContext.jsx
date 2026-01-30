import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) =>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    //로그인 정보 불러오기
    useEffect(()=>{
        const loginUser = localStorage.getItem('user');
        if(loginUser){
            setUser(JSON.parse(loginUser));
        }
        setLoading(false);
    },[]);

    const login = (userData) =>{
        localStorage.setItem('user',JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async (isManual = true) => {
        if (isManual) {
            try {
                await fetch('http://localhost:8080/dykj/api/members/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                alert("로그아웃 되었습니다.");
            } catch (error) {
                console.error("Logout error:", error);
            }
        }
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{user, setUser, login, logout, loading}}>
            {/* 회원 정보를 받아올 때까지 렌더링 멈춤 */}
            {!loading && children} 
        </AuthContext.Provider>
    );
    
};


// 로그인 정보 불러오는 훅
export const useAuth = () =>{
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error('useAuth는 AuthProvider 안에서만 사용 가능');
    }
    return context;
}