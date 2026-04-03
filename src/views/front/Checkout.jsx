// 結帳與購物車頁面，包含商品列表、購物車操作以及使用 react-hook-form 的訂單驗證。

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { currency } from "../../utils/filter"; // 引入自訂的千分位格式化工具
import { set, useForm } from "react-hook-form";
import { RotatingLines } from "react-loader-spinner";
import * as bootstrap from "bootstrap";
import SingleProductModal from "../../components/SingleProductModal";
import { validateEmail } from "../../utils/validation";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout() {
  // --- 狀態管理區 ---
  const [cart, setCart] = useState({}); // 儲存購物車資料與總計金額
  const [product, setProduct] = useState({}); // 儲存準備要在 Modal 顯示的單一商品資料
  const [products, setProducts] = useState([]); // 儲存商品列表資料
  const [loadingCartId, setLoadingCartId] = useState(null); // 紀錄當前正在加入購物車的商品 ID (用於防呆)
  const [loadingProductId, setLoadingProductId] = useState(null); // 紀錄當前正在讀取詳細資訊的商品 ID
  const productModalRef = useRef(null); // 使用 useRef 存放 Bootstrap Modal 實體

  // --- 表單驗證設定 (React Hook Form) ---
  const {
    register, // 用於綁定輸入框與驗證規則
    handleSubmit, // 用於處理表單送出事件
    formState: { errors }, // 包含表單的錯誤資訊
  } = useForm({
        mode: "onChange", // 只要輸入內容有變動，就會即時觸發驗證
        defaultValues: { // 預設填寫的表單資料 (測試用)
            email: "superrich@gmail.com",
            name: "郝有錢",
            tel: "0966888888",
            address: "台北市有錢區大發街88號",
        }
    });

  // --- API 請求區 ---
  // 取得所有商品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`); 
      setProducts(response.data.products); 
    } catch (error) {
      alert("失敗");
    }
  };

  // 取得目前使用者的購物車內容
  const getCart = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(response.data.data);
    } catch (error) {
      alert("失敗");
    }
  };

  // --- 生命週期與副作用管理 ---
  useEffect(() => {
    // 初始載入時打 API 獲取資料
    getProducts();
    getCart();
    // 初始化 Bootstrap Modal 並綁定給 useRef
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false
    });

    // 監聽 Modal 關閉事件，並移除網頁焦點 (避免按鈕殘留 active 狀態)
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
  }, []);


  // --- 購物車操作 ---
  // 加入購物車
  const addCart = async (id, qty=1) => {
      setLoadingCartId(id); // 開啟按鈕的 loading 狀態
      try {
          const data = {
              product_id: id,
              qty
          };
          // 發送 POST 請求將商品加入購物車
          const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
              data
          });
          alert("已加入購物車");

          // 加入成功後重新取得最新購物車資料，以更新畫面
          const response2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
          setCart(response2.data.data);
      } catch (error) {
          alert("失敗");
      } finally {
          setLoadingCartId(null); // 無論成功失敗，都要關閉 loading 狀態
      }
  };


  // 更新購物車內單一品項數量
  const updateCart = async (cartId, productId, qty=1) => {
    try {
      const data = {
        product_id: productId,
        qty 
      };
     
      const response = await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cartId}`,
        { data }
      );

      // 更新成功後重新獲取購物車資料
      getCart();
    } catch (error) {
      alert("失敗");
    }
  };

  // 刪除購物車內單一品項
  const deleteCart = async (cartId) => {
  try {
    const response = await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartId}`);
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

  // --- 表單與 Modal 處理 ---
  // 處理表單送出 (React Hook Form 會確保驗證通過才執行此函式)
  const onSubmit = async (formData) => {
    console.log("表單資料：", formData);
    try {
        const data = {
            user: formData,
            message: formData.message || "", // 備註若未填則給空字串
        };
        const response = await axios.post(`${API_BASE}/api/${API_PATH}/order`, { data });
        alert("訂單送出成功！");

        // 訂單送出後，購物車會被後端清空，需重新抓取更新畫面
        const response2 = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
        setCart(response2.data.data);
    } catch (error) {
        alert("失敗");
    }    
  };

  // 點擊「查看更多」，獲取單一商品詳細資訊並開啟 Modal
  const handleView = async (id) => {
    setLoadingProductId(id);
      try {
          const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
          setProduct(response.data.product);
      } catch (error) {
          alert("失敗");
      } finally {
          setLoadingProductId(null);
      }

      productModalRef.current.show(); // 打開 Modal
  };

  // 關閉 Modal 的輔助函式
  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <div className="container">
      {/* 產品列表 */}
      <table className="table align-middle">
        <thead>
            <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            {
                products.map(product => (
                    <tr key={product.id}>
                        <td style={{ width: "200px" }}>
                            <div
                            style={{
                                height: "100px",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundImage: `url(${product.imageUrl})`,
                            }}
                            ></div>
                        </td>
                        <td>{product.title}</td>
                        <td>
                            <del className="h6">原價：{product.origin_price}</del>
                            <div className="h5">售價：{product.price}</div>
                        </td>
                        <td>
                            <div className="btn-group btn-group-sm">
                            {/* 查看更多按鈕，點擊時會顯示 loading 特效防止重複點擊 */}
                            <button type="button" className="btn btn-outline-secondary"
                                onClick={() => handleView(product.id)}
                                disabled={loadingProductId === product.id}
                                >
                                {
                                  loadingProductId === product.id ? (
                                    <RotatingLines 
                                      height="20"
                                      width="80"
                                      color="grey"
                                      ariaLabel="rotating-lines-loading"
                                    />
                                  ) : "查看更多"
                                }
                            </button>
                            {/* 加入購物車按鈕，同樣具備 loading 防呆機制 */}
                            <button type="button" className="btn btn-outline-danger"
                                onClick={() => addCart(product.id)} 
                                disabled={loadingCartId === product.id}>
                                {
                                  loadingCartId === product.id ? (
                                    <RotatingLines 
                                      height="20"
                                      width="80"
                                      color="grey"
                                      ariaLabel="rotating-lines-loading"
                                    />
                                  ) : "加到購物車"
                                }
                            </button>
                            </div>
                        </td>
                    </tr>
                ))
            }
        </tbody>
      </table>

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
                    {/* 數量輸入框：設定為 readOnly 強迫使用者點擊加減按鈕，避免輸入非法字元 */}
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

      {/* 結帳頁面 */}
      <div className="my-5 row justify-content-center">
      {/* 表單送出時，交由 react-hook-form 的 handleSubmit 接管，驗證成功後才觸發 onSubmit */}
      <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
          <label htmlFor="email" className="form-label">
              Email
          </label>
          <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="請輸入 Email"
              {...register("email", validateEmail)} // 套用自訂義的驗證規則
          />
          {/* 若 errors 中有 email 的錯誤訊息，則渲染出來 */}
          {
              errors.email && (
                  <p className="text-danger mt-1">
                      {errors.email.message}
                  </p>
              )
          }
          </div>

          <div className="mb-3">
          <label htmlFor="name" className="form-label">
              收件人姓名
          </label>
          <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="請輸入姓名"
              {...register("name", {
                  required: "姓名為必填",
                  minLength: {
                      value: 2,
                      message: "姓名至少需要 2 個字"
                  },
              })}
          />
          {
              errors.name && (
                  <p className="text-danger mt-1">
                      {errors.name.message}
                  </p>
              )
          }
          </div>

          <div className="mb-3">
          <label htmlFor="tel" className="form-label">
              收件人手機號碼
          </label>
          <input
              id="tel"
              name="tel"
              type="tel"
              className="form-control"
              placeholder="請輸入手機號碼"
              {...register("tel", {
                  required: "手機號碼為必填",
                  pattern: {
                      value: /^09\d{8}$/,
                      message: "請輸入有效的台灣手機號碼"
                  },
                  minLength: {
                      value: 10,
                      message: "手機號碼至少需要 10 位數"
                  },
                  maxLength: {
                      value: 10,
                      message: "手機號碼最多只能有 10 位數"
                  }
              })}
          />
          {
              errors.tel && (
                  <p className="text-danger mt-1">
                      {errors.tel.message}
                  </p>
              )
          }
          </div>

          <div className="mb-3">
          <label htmlFor="address" className="form-label">
              收件人地址
          </label>
          <input
              id="address"
              name="address"
              type="text"
              className="form-control"
              placeholder="請輸入地址"
              {...register("address", {
                  required: "地址為必填",
                  minLength: {
                      value: 5,
                      message: "地址至少需要 5 個字"
                  },
              })}
          />
          {
              errors.address && (
                  <p className="text-danger mt-1">
                      {errors.address.message}
                  </p>
              )
          }
          </div>

          <div className="mb-3">
          <label htmlFor="message" className="form-label">
              留言
          </label>
          <textarea
              id="message"
              className="form-control"
              cols="30"
              rows="10"
              {...register("message")}
          ></textarea>
          </div>
          <div className="text-end">
          <button type="submit" className="btn btn-danger">
              送出訂單
          </button>
          </div>
      </form>
      </div>

      {/* 單一商品資訊 Modal 元件 */}
      <SingleProductModal product={product}
      addCart={addCart}
      closeModal={closeModal}
       />

    </div>
  )
}

export default Checkout;