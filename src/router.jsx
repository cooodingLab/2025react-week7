
// 定義應用程式的所有路徑與對應的元件，並劃分「前台」與「後台」的不同版型與權限控制。

import { createHashRouter } from "react-router";
import FrontendLayout from "./layout/FrontendLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import Checkout from "./views/front/Checkout";
import Login from "./views/Login";
import NotFound from "./views/front/NotFound";
import AdminLayout from "./layout/AdminLayout";
import AdminProducts from "./views/admin/AdminProducts";
import AdminOrders from "./views/admin/AdminOrders";
import ProtectedRoute from "./components/ProtectedRoute";

// 使用 createHashRouter 建立 Hash 路由，適合部署在 GitHub Pages 等靜態網站托管服務上，因為它不需要後端支援來處理路由。
export const router = createHashRouter([
    // --- 前台路由區塊 ---
    {
        path: '/', // 根目錄
        element: <FrontendLayout />, // 以前台共用版型為基底
        children: [{ // 定義 FrontendLayout 的子路由 (會渲染在 Outlet 處)
            index: true,
            element: <Home />,
        },
        {
            path: 'product',
            element: <Products />,
        },
        {
            path: 'product/:id', // 動態路由，用來接收特定商品的 ID
            element: <SingleProduct />,
        },
        {
            path: 'cart',
            element: <Cart />,
        },
        {
            path: 'checkout',
            element: <Checkout />,
        },
        {
            path: 'login',
            element: <Login />,
        },
    ],
    },
    {
        // --- 後台路由區塊 ---
        path: '/admin', // 後台的根目錄
        element: (
            // 透過 ProtectedRoute 進行權限攔截，未登入或 Token 失效會被擋下並導向登入頁
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: 'product',
                element: <AdminProducts />,
            },
            {
                path: 'order',
                element: <AdminOrders />,
            }
        ]
    },
    {
        // --- 錯誤處理 ---
        path: '*', // 萬用字元：當使用者輸入了上面沒有定義的網址時
        element: <NotFound />, // 顯示 404 找不到頁面
    },
]);