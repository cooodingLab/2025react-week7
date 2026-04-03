// 整合全域的提示訊息元件與路由供應器。

import { RouterProvider } from "react-router";
import { router } from "./router"; // 引入定義好的路由表
import "./assets/style.css";
import MessageToast from "./components/MessageToast.jsx";

function App() {
  return(
    <>
      {/* 放置全域的 Toast 提示訊息，只要 Redux state 有變動就會在這裡顯示 */}
      <MessageToast />
      {/* 注入定義好的 router 設定 */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;