// 負責在進入後台路由前，驗證使用者的登入狀態。
import axios from "axios";
import { RotatingSquare, RotatingTriangles } from "react-loader-spinner"; 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";


const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProtectedRoute({ children }) {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true); // 控制驗證期間的 Loading 畫面
    const navigate = useNavigate();

    // 呼叫驗證 API 檢查 Token 是否有效
    const checkLogin = async () => {
        try {
            const response = await axios.post(`${API_BASE}/api/user/check`);
            console.log(response.data);
            setIsAuth(true);
        } catch (error) {
            setIsAuth(false);
            alert("尚未登入：" + (error.response?.data?.message || "請先登入"));
            navigate('/login'); // 登入失敗時，強制導向到登入頁面
        }finally {
            setLoading(false); // 無論結果如何，關閉 Loading 狀態
        }
    };

    useEffect(() => {
        // 元件掛載時，嘗試從 Cookie 取回 Token 並塞入 Axios 標頭
        const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
        if(token){
            axios.defaults.headers.common['Authorization'] = token;
        }

        checkLogin();

    }, []); 

    // 1. 若還在驗證中，顯示 Loading 動畫，不渲染子元件
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <RotatingSquare />
            </div>
        );
    }

    // 2. 驗證結束後，若有權限才渲染 children (即 AdminLayout)，否則回傳 null (通常已經被 navigate 導走了)
    return isAuth ? children : null; 
}

export default ProtectedRoute;