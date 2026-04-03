// 負責取得、顯示產品列表，並控制 Modal 的開關與狀態傳遞。
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import * as bootstrap from "bootstrap";
import Pagination from '../../components/Pagination';
import ProductModal from '../../components/ProductModal';
// import { useDispatch } from 'react-redux';
import { createAsyncMessage } from '../../slice/messageSlice';  
import useMessage from '../../hooks/useMessage';


const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

// 定義新增產品時的預設空資料結構
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [], 
  shipping:"",
};

function AdminProducts() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA); // 傳遞給 Modal 的資料
  const [modalType, setModalType] = useState(""); // 控制 Modal 是新增、編輯還是刪除模式
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);
  // const dispatch = useDispatch();
  const { showSuccess, showError } = useMessage(); // 使用自訂 Hook 呼叫 Toast 訊息

  // 取得產品列表資料，並更新 products 與 pagination 狀態
  const getProducts = async (page=1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,);
      setProducts(response.data.products); 
      setPagination(response.data.pagination);
      showSuccess("成功取得產品列表");
    } catch (error) {
      // dispatch(createAsyncMessage(error.response.data));
      showError(error.response?.data?.message || "取得失敗");
    }
  }

  // 用於存放 Bootstrap Modal 的 DOM 節點與實例，確保在整個組件生命週期中保持穩定，避免因重新渲染而丟失或重置 Modal 狀態。
  const modalDOM = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    // 元件掛載時，初始化 Bootstrap Modal 實例，確保可以透過 JS 手動控制顯示/隱藏
    if (modalDOM.current) {
      modalInstance.current = new bootstrap.Modal(modalDOM.current, {
        keyboard: false,
      });
    }

    getProducts();

  }, []); 

  // 開啟 Modal 共用函式，根據 type 決定是新增/編輯/刪除，並寫入對應的商品資料
  const openModal = (type, product) => {
    setModalType(type);
    // 使用淺拷貝確保資料獨立性，特別處理 imagesUrl 陣列避免參照問題
    setTemplateProduct({ 
      ...INITIAL_TEMPLATE_DATA, 
      ...product,
      imagesUrl: product.imagesUrl ? [...product.imagesUrl] : [] 
    });
    modalInstance.current.show(); 
  };

  const closeModal = () => {
    modalInstance.current.hide(); 
  };

  return (
    <>
    <div className='container'>
            <h2 className="">產品列表</h2>
            <div className="text-end mt-4">
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => openModal("create",INITIAL_TEMPLATE_DATA)}>
                建立新的產品
            </button>
            </div>
            <table className="table">
            <thead>
                <tr>
                <th scope="col">分類</th>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">編輯</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product) => (
                <tr key={product.id}>
                    <td>{product.category}</td>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td className={`${product.is_enabled && 'text-success'}`}>{product.is_enabled ? "啟用" : "未啟用"}</td>
                    <td>
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal('edit', product)}>編輯</button>
                        <button type="button" className="btn btn-outline-danger btn-sm"  onClick={() => openModal('delete', product)}>刪除</button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            <Pagination pagination={pagination} onChangePage={getProducts} />
    </div>

    {/* 將狀態與操作函式往下傳遞給 Modal 元件 */}
    <ProductModal
      modalDOM={modalDOM} 
      modalType={modalType}
      templateProduct={templateProduct}
      getProducts={getProducts}
      closeModal={closeModal}
    />
  </>

  );
}

export default AdminProducts;
