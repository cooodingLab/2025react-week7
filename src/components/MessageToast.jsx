// 讀取 Redux 內的訊息狀態，並迭代渲染出畫面。
import { useSelector } from "react-redux";


function MessageToast() {
    // 訂閱 Redux store 內的 message state
    const messages = useSelector((state) => state.message); 
    return (
        <div className="toast-container position-fixed top-0 end-0 p-3">
            {messages.map((message) => (
                    <div key={message.id} className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className={`toast-header text-white bg-${message.type}`}>
                            <strong className="me-auto">{message.title}</strong>
                            <small>11 mins ago</small>
                            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                            {message.text}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default MessageToast;