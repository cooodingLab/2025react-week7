// 處理管理員登入，並將取得的 Token 存入 Cookie 及 Axios 全域設定中。
import { useState } from 'react';
import axios from "axios";
import { useForm } from "react-hook-form";
import { validateEmail, validatePassword } from '../utils/validation';
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ getProducts, setIsAuth }) {
    const navigate = useNavigate();

    // 初始化 React Hook Form，接管表單狀態與驗證邏輯
    const {
        register,
        handleSubmit,
        formState: { errors, isValid }, // isValid 用來判斷當前表單是否所有欄位都驗證通過
    } = useForm({
        mode: "onChange", // 輸入框內容一改變就進行驗證
        defaultValues: {
            username:"",
            password:"",
        }
    });

    // 表單驗證通過後觸發的提交函式
    const onSubmit = async (formData) => {
        try {
            // 發送登入請求，取得伺服器回傳的 token 與過期時間 (expired)
            const response = await axios.post(`${API_BASE}/admin/signin`, formData);
            const {token, expired} = response.data;
            // 1. 將 Token 存入 Cookie，並設定與伺服器同步的過期時間
            document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
            
            // 2. 將 Token 設為 Axios 全域預設標頭，後續發送需授權的 API 時自動帶上
            axios.defaults.headers.common['Authorization'] = token;
            alert("登入成功！");

            // 登入成功，導向後台產品列表
            navigate("/admin/product"); 
        
        } catch (error) {
            // (若有用到 setIsAuth) 登入失敗時切換權限狀態
            setIsAuth(false);
            alert("登入失敗：" + (error.response?.data?.message || "請檢查帳密"));
        }
    }

    return(
        <div className="container login">
            <h1>請先登入</h1>
            <form className="form-floating" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-floating mb-3">
                    <input type="email" 
                        className="form-control" 
                        name="username" 
                        placeholder="name@example.com" 
                        // 註冊帳號欄位，並帶入外部的 email 驗證規則
                        {...register("username", validateEmail)}
                        />
                    <label htmlFor="username">Email address</label>
                    {
                       errors.username && (
                            <p className="text-danger">{errors.username.message}</p>
                        )
                    }
                </div>
                <div className="form-floating">
                    <input type="password" name="password" 
                        className="form-control" id="password" 
                        placeholder="Password" 
                        // 註冊密碼欄位，並帶入外部的密碼驗證規則
                        {...register("password", validatePassword)}
                    />
                    <label htmlFor="password">Password</label>
                    {
                       errors.password && (
                            <p className="text-danger">{errors.password.message}</p>
                        )
                    }
                </div>
                {/* 提交按鈕：
                  透過 React Hook Form 的 !isValid 來判斷，
                  如果表單驗證未完全通過，按鈕就會反灰禁用 (disabled)
                */}
                <button type='submit' className="btn btn-primary w-100 mt-2"
                    disabled={!isValid}>
                    登入
                </button>
            </form>
        </div>
    )
}

export default Login;