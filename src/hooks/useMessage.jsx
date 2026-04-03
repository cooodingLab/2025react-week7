// 封裝 Redux Dispatch 邏輯，讓元件內部呼叫提示訊息時更直覺、簡潔。
import { useDispatch } from 'react-redux';
import { createAsyncMessage } from '../slice/messageSlice';

function useMessage() {
    const dispatch = useDispatch();

    // 封裝成功訊息的 Dispatch，讓元件內部呼叫時更簡潔。
    const showSuccess = (message) => {
        dispatch(createAsyncMessage({
            success: true,
            message,
        }));
    };

    // 封裝失敗訊息的 Dispatch
    const showError = (message) => {
        dispatch(createAsyncMessage({
            success: false,
            message,
        }));
    }

    // 回傳這兩個方法供元件使用
    return { showSuccess, showError };
}



export default useMessage;