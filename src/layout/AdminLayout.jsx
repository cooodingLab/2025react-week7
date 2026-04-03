import { Link, Outlet } from "react-router";

function AdminLayout() {
  return(
    <>
        <header>
            <ul className="nav">
                <li className="nav-item">
                    <Link className="nav-link" to="/admin/product">
                        後台產品列表
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/admin/order">
                        後台訂單列表
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

export default AdminLayout;