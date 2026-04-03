// 負責串接 API 取得「所有產品列表」並渲染到畫面上。

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
  // 定義 products 狀態，預設為空陣列，用來存放從 API 抓回來的產品資料
  const [products, setProducts ] = useState([]);
  // useNavigate 是一個 Hook，用來透過程式碼進行頁面跳轉
  const navigate = useNavigate();

  // useEffect：在元件「初次渲染完成」時，執行裡面的程式碼 (這裡是用來抓取產品資料的 API)
  useEffect(() => {
    const getProducts = async () => {
        try {
            // 發送 GET 請求取得產品列表
            const response = await axios.get(
                `${API_BASE}/api/${API_PATH}/products`,
            );
            // 將取得的產品資料存入 state 中
            setProducts(response.data.products);
        } catch (error) {       
            alert("失敗");
        }
    };
    getProducts();
  }, []);

  // 點擊「查看更多」時執行的函式，會跳轉到對應產品的詳細頁面
  const handleView = async (id) => {
    // 透過 navigate 跳轉到單一產品頁面，並將產品 id 帶入網址中
    navigate(`/product/${id}`);
  }

  return (
    <div className="container">
        <div className="row">
            {/* 使用 map 迴圈將 products 陣列中的每一筆資料渲染成卡片 */}
            {
                products.map((product) =>  (
                    // 在迴圈中，每個最外層元素都需要加上唯一的 key 屬性，幫助 React 效能優化
                    <div className="col-md-4 mb-3" key={product.id}>
                        <div className="card">
                            <img src={product.imageUrl} className="card-img-top" alt={product.title} />
                            <div className="card-body">
                                <h5 className="card-title">{product.title}</h5>
                                <p className="card-text">{product.description}</p>
                                <p className="card-text"><del><strong>原價:</strong> {product.origin_price} 元</del></p>
                                <p className="card-text"><strong>售價:</strong> {product.price} 元</p>
                                <button className="btn btn-primary"
                                    onClick={() => handleView(product.id)}
                                    >
                                    查看更多
                                </button>
                            </div>
                        </div>
                    </div>
            ))}
        </div>
    </div>
  )
}

export default Products;