import { useState, useEffect } from "react";
import { useParams } from "react-router"; // 用來取得網址上的動態參數
import axios from "axios";


const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
    // 透過 useParams 解析網址，取出我們在 router.jsx 設定的 `:id` 參數，這裡的 id 就是產品的 id
    const {id} = useParams();
    // 定義 product 狀態，預設為 null (因為還沒抓到資料)
    const [product, setProduct] = useState(null);

    // 負責發送 API 請求取得「單筆」產品資料的函式
    const handleView = async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
            setProduct(response.data.product);
        } catch (error) {
            alert("失敗");
        }
    };

    // 當元件載入，或網址的 `id` 發生改變時，就會觸發重新抓取資料的 useEffect
    useEffect(() => {
        if (id) {
            handleView(id);
        }
    }, [id]);

    // 加入購物車的函式 (預設數量 qty 為 1)
    const addCart = async (id, qty=1) => {
        try {
            // 組合 API 需要的資料格式
            const data = {
                product_id: id,
                qty
            };
            // 發送 POST 請求將商品加入購物車
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
                data
            });
            alert("已加入購物車");
        } catch (error) {
            alert("失敗");
        }
    };

  // 如果 product 還是 null (資料還沒回來)，先顯示「查無產品」或 Loading 畫面
  // 如果有資料了，就顯示產品細節卡片
  return (
    !product ? (<h2>查無產品</h2>) : (
    <div className="container mt-3">
        <div className="card" style={{ width: "18rem" }}>
            <img src={product.imageUrl} className="card-img-top" alt={product.title} />
            <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text"><strong>分類:</strong> {product.category}</p>
                <p className="card-text"><strong>單位:</strong> {product.unit}</p>
                <p className="card-text"><del><strong>原價:</strong> {product.origin_price} 元</del></p>
                <p className="card-text"><strong>售價:</strong> {product.price} 元</p>
                <button className="btn btn-primary"
                    onClick={() => addCart(product.id)}
                    >
                    加入購物車
                </button>
            </div>
        </div>
    </div>
    )
  );
}

export default SingleProduct;