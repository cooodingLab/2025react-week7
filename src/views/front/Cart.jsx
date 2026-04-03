import { useState, useEffect } from "react";
import axios from "axios";
import { currency } from "../../utils/filter"; // 引入自訂的千分位或貨幣格式化工具

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart() {
  // 用來存放購物車整體的資料 (包含 carts 陣列與 final_total 總額)
  const [cart, setCart] = useState({});

  // 取得購物車列表
  const getCart = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(response.data.data);
    } catch (error) {
      alert("失敗");
    }
  };

  // 元件初次載入時，自動抓取購物車資料
  useEffect(() => {
    getCart();
  }, []);

  // 更新商品數量
  const updateCart = async (cartId, productId, qty=1) => {
    try {
      const data = {
        product_id: productId,
        qty // 傳入新的數量
      };
      // 使用 PUT 請求更新特定購物車項目 (cartId)
      const response = await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data }
      );
      // 更新成功後，重新抓取一次購物車列表以更新畫面
      getCart();
    } catch (error) {
      alert("失敗");
    }
  };
  // 清除單一筆購物車
  const deleteCart = async (cartId) => {
  try {
    // 使用 DELETE 請求刪除特定項目 (cartId)
    const response = await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartId}`);
    // 刪除成功後，重新抓取列表以更新畫面
    getCart();
  } catch (error) {
    alert("失敗");
  }
};

  // 清空購物車
  const clearCart = async () => {
    try {
      // 注意這裡是對 /carts 發送 DELETE 請求 (複數)，代表清空整個購物車
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
      getCart();
    } catch (error) {
      alert("失敗");
    }
  };

  return (
    <div className="container">
      <h2>購物車列表</h2>
      <div className="text-end mt-4">
        <button type="button" className="btn btn-outline-danger"
          onClick={() => clearCart()}
          >
          清空購物車
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">品名</th>
            <th scope="col">數量/單位</th>
            <th scope="col">小計</th>
          </tr>
        </thead>
        <tbody>
          {/* 可選串連運算子 (?.) 確保 cart.carts 存在時才執行 map，避免剛載入時報錯 */}
          {
            cart?.carts?.map((cartItem) => (
              <tr key={cartItem.id}>
                <td>
                  <button type="button" className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteCart(cartItem.id)}
                    > 
                    刪除
                  </button>
                </td>
                <th scope="row">{cartItem.product.title}</th>
                <td>
                  <div className="input-group mb-3">
                    {/* 數量輸入框：設定為唯讀 (readOnly)，強迫使用者透過按鈕操作 */}
                    <input 
                      type="number" 
                      className="form-control text-center" // 加上 text-center 讓數字置中
                      value={cartItem.qty} 
                      readOnly 
                    />
                    {/* 減號按鈕 */}
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      disabled={cartItem.qty <= 1} // 當數量為 1 時禁用按鈕，防止扣減為 0 或負數
                      onClick={() => updateCart(
                        cartItem.id, 
                        cartItem.product.id, 
                        cartItem.qty - 1 // 數量 - 1
                      )}
                    >
                      -
                    </button>
                    {/* 加號按鈕 */}
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      onClick={() => updateCart(
                        cartItem.id, 
                        cartItem.product.id, 
                        cartItem.qty + 1 // 數量 + 1
                      )}
                    >
                      +
                    </button>
                    
                    {/* 單位 */}
                    <span className="input-group-text" id="inputGroup-sizing-default">
                      {cartItem.product.unit}
                    </span>
                  </div>
                </td>
                {/* 使用外部引入的 currency 函式將金額轉換為千位分隔符格式 */}
                <td className="text-end">{currency(cartItem.final_total)}</td>
              </tr>
            ))
          }
        </tbody>
        <tfoot>
          <tr>
            <td className="text-end" colSpan="3">
              總計
            </td>
            <td className="text-end">{currency(cart.final_total || 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default Cart;