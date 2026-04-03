// 管理全域的 Toast 提示訊息，並支援非同步自動關閉。
import { configureStore } from "@reduxjs/toolkit";
import messageReducer from "../slice/messageSlice";

// 建立並匯出 Redux Store，註冊 message 狀態分支和對應的 reducer。這樣全域的 Toast 提示訊息就可以在應用程式中被管理和使用了。
export const store = configureStore({
    reducer: {
        message: messageReducer,
    },
}); 

export default store;