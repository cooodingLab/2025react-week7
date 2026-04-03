// 前台的共用版型（Layout），負責顯示固定的導覽列與頁尾，並透過 <Outlet /> 動態切換主要內容。

import { Link, Outlet } from "react-router";

function FrontendLayout() { // AdminLayout 邏輯相同，只是導覽列的內容不同
  return(
    <>
        <header>
            <ul className="nav">
                <li className="nav-item">
                    {/* 導覽列：使用 Link 避免整頁重整 */}
                    <Link className="nav-link" to="/">
                        首頁
                    </Link>
                </li>
                <li className="nav-item">
                    {/* 路由出口：根據目前的網址，將對應的子元件 (如 Home, Products) 渲染在此處 */}
                    <Link className="nav-link" to="/product">
                        產品列表
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/cart">
                        購物車
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/checkout">
                        結帳
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/login">
                        登入
                    </Link>
                </li>
            </ul>    
        </header>    
        <main>
            {/* <Outlet /> 是一個佔位符。
                當網址符合某個子路由時，對應的元件 (如 Home, Products) 就會在這裡渲染出來 */}
            <Outlet />
        </main>
        <footer className="mt-5 text-center">
            <p>© 2025 React 主線任務網站</p>
      </footer>
    </>
  )
}

export default FrontendLayout;