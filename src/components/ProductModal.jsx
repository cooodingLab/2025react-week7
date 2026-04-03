// 處理新增、編輯、刪除商品的所有邏輯，包含圖片上傳與表單雙向綁定。
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { createAsyncMessage } from "../slice/messageSlice";


const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
    modalDOM,
    modalType,
    templateProduct,
    getProducts,
    closeModal,
}) {
    
    const [tempData, setTempData] = useState(templateProduct);
    const dispatch = useDispatch();

    // 當外部傳入的 templateProduct 改變時 (例如點擊不同商品的「編輯」)，同步更新內部狀態 tempData，確保表單顯示正確的資料。
    useEffect(() => {
        setTempData(templateProduct);
    },[templateProduct]);

    // 一般輸入框與 Checkbox 的通用 onChange 處理函式，根據輸入類型自動更新 tempData 狀態。
    const handleModalInputChange = (e) => {
        const {name, value, checked, type} = e.target
        setTempData((preData) => ({
        ...preData,
        [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // 副圖陣列的 onChange 處理函式，根據輸入的 index 動態更新對應的圖片網址，同時自動管理新增與刪除圖片欄位的邏輯。
    const handleModalImageChange = (index, value) => {
        setTempData((pre) => {
        const newImage = pre.imagesUrl ? [...pre.imagesUrl] : [];
        newImage[index] = value; 

        // 自動擴充輸入框：如果輸入的是最後一格且有值，且總數未滿 5，自動加一格空字串
        if (
            value !== "" &&
            index === newImage.length - 1 &&
            newImage.length < 5
            ) {
            newImage.push("");
            }

        // 自動收合輸入框：如果清空內容，且不是唯一一格，自動移除最後一格
        if (
            value === "" &&
            newImage.length > 1 &&
            newImage[newImage.length - 1] === ""
            ) {
            newImage.pop();
            }

        return{
            ...pre,
            imagesUrl:newImage,
        };
        });
    };

    // 手動新增副圖欄位的函式，確保不會超過 5 張圖片的限制。
    const handleAddImage = () => {
        setTempData((pre) => {
        const newImage = pre.imagesUrl ? [...pre.imagesUrl] : [];
        newImage.push("");
        return{
            ...pre,
            imagesUrl:newImage,
        };
        });
    };

    // 手動刪除最後一個副圖欄位的函式，確保至少保留一個輸入框。
    const handleRemoveImage = () => {
        setTempData((pre) => {
        const newImage = pre.imagesUrl ? [...pre.imagesUrl] : [];
        newImage.pop();
        return{
            ...pre,
            imagesUrl:newImage,
        };
        });
    };

    // 處理新增或編輯產品的 API 請求，根據 modalType 動態決定使用 POST 還是 PUT 方法，同時將表單資料轉換為 API 所需的格式。
    const updateProduct = async (id) => {
        // 預設為新增邏輯
        let url = `${API_BASE}/api/${API_PATH}/admin/product`
        let method = 'post'

        // 若為編輯模式，切換 URL 與 Method
        if(modalType === 'edit'){
        url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`
        method = 'put'
        }

        // 整理即將送出的資料格式 (將價格轉為數字，啟用狀態轉為 1/0，過濾掉空的圖片網址)
        const productData = {
        data:{
            ...tempData,
            origin_price: Number(tempData.origin_price),
            price: Number(tempData.price),
            is_enabled:tempData.is_enabled ? 1 : 0,
            imagesUrl: tempData.imagesUrl ? tempData.imagesUrl.filter(url => url !== "") : [],
        },
        };

        try {
        const response = await axios[method](url, productData);  
            console.log(response.data);
            // dispatch(createAsyncMessage(response.data.message));
            dispatch(createAsyncMessage(response.data));
            getProducts(); 
            closeModal(); 
        } catch (error) {
            alert("失敗");
        }
    }

    // 處理刪除產品的 API 請求，根據產品 ID 發送 DELETE 請求，成功後刷新產品列表並關閉 Modal。
    const delProduct = async (id) => {
        try {
        const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`)
        console.log(response.data);
        getProducts(); 
        closeModal(); 
        } catch (error) {
        alert("失敗");
        }
    };

    // 處理圖片實體檔案上傳的函式，將選擇的檔案包裝成 FormData 發送到後端 API，成功後將回傳的圖片網址自動填入主圖欄位，並清空檔案輸入框。
    const uploadImage = async (e) => {
        // 使用 FormData 格式上傳檔案，確保後端能正確接收 multipart/form-data 類型的請求。
        const file = e.target.files?.[0];
        if(!file){
        return
        }

        try {
        const formData = new FormData();
        formData.append('file-to-upload', file);

        const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
        
        // 上傳成功後，將回傳的網址寫入主圖欄位
        setTempData((pre) => ({
            ...pre,
            imageUrl: response.data.imageUrl,
        }));

        // 清空 input file 的值，允許重複上傳相同檔案
        if (e.target) {
            e.target.value = ""; 
        }

        } catch (error) {
            alert("失敗");
        }
    }

    return(
        <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true" ref={modalDOM}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content border-0">

                <div className={`modal-header bg-${modalType === 'delete' ? 'danger':'dark'} text-white`}>
                    <h5 id="productModalLabel" className="modal-title">
                    <span>{modalType === 'delete' ? '刪除' :
                        modalType === 'edit' ? '編輯' : '新增'}產品</span>
                    </h5>
                    <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    ></button>
                </div>
                <div className="modal-body">
                    {
                    modalType === 'delete' ? (
                        <p className="fs-4">
                        確定要刪除
                        <span className="text-danger">{tempData.title}</span>嗎？
                        </p>
                    ) : (
                        <div className="row">
                            <div className="col-sm-4">
                                <div className="mb-2">
                                    <div className="mb-3">
                                        <label htmlFor="fileUpload" className="form-label">
                                            上傳圖片
                                        </label>
                                        <input 
                                            className="form-control" 
                                            type="file" 
                                            name="fileUpload" 
                                            id="fileUpload" 
                                            accept=".jpg, .jpeg, .png"
                                            onChange={(e) => uploadImage(e)} 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="imageUrl" className="form-label">
                                            輸入圖片網址
                                        </label>
                                        <input
                                        type="text"
                                        id="imageUrl"
                                        name="imageUrl"
                                        className="form-control"
                                        placeholder="請輸入圖片連結"
                                        value={tempData.imageUrl}
                                        onChange={(e) => handleModalInputChange(e)}
                                        />
                                    </div>
                                    {
                                        tempData.imageUrl && (
                                        <img className="img-fluid" src={tempData.imageUrl} alt="主圖" />
                                        )
                                    }
                                </div>
                                <div>
                                {
                                    tempData.imagesUrl?.map((url, index) => (
                                    <div key={index}>
                                        <label htmlFor="imageUrl" className="form-label">
                                        輸入圖片網址
                                        </label>
                                        <input
                                        type="text"
                                        className="form-control"
                                        placeholder={`圖片網址${index + 1}`}
                                        value={url}
                                        onChange={(e) => handleModalImageChange(index,e.target.value)}
                                        />
                                        {
                                        url &&
                                        <img
                                            className="img-fluid"
                                            src={url}
                                            alt={`副圖${index + 1}`}
                                        />
                                        }
                                    </div>
                                    ))
                                }
                                {/* {
                                    tempData.imagesUrl.length < 5 && 
                                    tempData.imagesUrl[tempData.imagesUrl.length - 1] !== "" &&
                                    <button className="btn btn-outline-primary btn-sm d-block w-100"
                                        onClick={() => handleAddImage()}>
                                        新增圖片
                                    </button>
                                } */}
                                {
                                    tempData.imagesUrl?.length < 5 && 
                                    tempData.imagesUrl[tempData.imagesUrl.length - 1] !== "" && (
                                    <button className="btn btn-outline-primary btn-sm d-block w-100"
                                        onClick={() => handleAddImage()}>
                                        新增圖片
                                    </button>
                                    )
                                }
                                </div>
                                <div>
                                {/* {
                                    tempData.imagesUrl.length >= 1 && 
                                    <button className="btn btn-outline-danger btn-sm d-block w-100"
                                    onClick={() => handleRemoveImage()}>
                                    刪除圖片
                                    </button>
                                } */}
                                {
                                    tempData.imagesUrl?.length >= 1 && (
                                    <button className="btn btn-outline-danger btn-sm d-block w-100"
                                        onClick={() => handleRemoveImage()}>
                                        刪除圖片
                                    </button>
                                    )
                                }
                                </div>
                            </div>
                            <div className="col-sm-8">
                                <div className="mb-3">
                                <label htmlFor="title" className="form-label">標題</label>
                                <input
                                    name="title"
                                    id="title"
                                    type="text"
                                    className="form-control"
                                    placeholder="請輸入標題"
                                    value={tempData.title}
                                    onChange={(e) => handleModalInputChange(e)}
                                    />
                                </div>

                                <div className="row">
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="category" className="form-label">分類</label>
                                    <input
                                    name="category"
                                    id="category"
                                    type="text"
                                    className="form-control"
                                    placeholder="請輸入分類"
                                    value={tempData.category}
                                    onChange={(e) => handleModalInputChange(e)}
                                    />
                                </div>
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="unit" className="form-label">單位</label>
                                    <input
                                    name="unit"
                                    id="unit"
                                    type="text"
                                    className="form-control"
                                    placeholder="請輸入單位"
                                    value={tempData.unit}
                                    onChange={(e) => handleModalInputChange(e)}
                                    />
                                </div>
                                </div>

                                <div className="row">
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="origin_price" className="form-label">原價</label>
                                    <input
                                    name="origin_price"
                                    id="origin_price"
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="請輸入原價"
                                    value={tempData.origin_price}
                                    onChange={(e) => handleModalInputChange(e)}
                                    />
                                </div>
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="price" className="form-label">售價</label>
                                    <input
                                    name="price"
                                    id="price"
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="請輸入售價"
                                    value={tempData.price}
                                    onChange={(e) => handleModalInputChange(e)}
                                    />
                                </div>
                                </div>
                                <hr />

                                <div className="mb-3">
                                <label htmlFor="description" className="form-label">產品描述</label>
                                <textarea
                                    name="description"
                                    id="description"
                                    className="form-control"
                                    placeholder="請輸入產品描述"
                                    value={tempData.description}
                                    onChange={(e) => handleModalInputChange(e)}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                <label htmlFor="content" className="form-label">說明內容</label>
                                <textarea
                                    name="content"
                                    id="content"
                                    className="form-control"
                                    placeholder="請輸入說明內容"
                                    value={tempData.content}
                                    onChange={(e) => handleModalInputChange(e)}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-check-label" htmlFor="shipping">
                                        配送方式
                                    </label>
                                    <select
                                        id="shipping"
                                        name="shipping"
                                        className="form-select"
                                        aria-label="Default select example"
                                        value={tempData.shipping}
                                        onChange={(e) => handleModalInputChange(e)}
                                        >
                                        <option value="">請選擇</option>
                                        <option value="cvs_pickup">超商取貨</option>
                                        <option value="home_delivery">宅配到府</option>
                                        <option value="store_pickup">門市自取</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                        name="is_enabled"
                                        id="is_enabled"
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={tempData.is_enabled}
                                        onChange={(e) => handleModalInputChange(e)}
                                        />
                                        <label className="form-check-label" htmlFor="is_enabled">
                                        是否啟用
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </div>
                <div className="modal-footer">
                    {
                    modalType === 'delete' ? (
                        <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => delProduct(tempData.id)}>
                        刪除
                        </button>
                    ) : (
                        <>                
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => closeModal()}
                            >
                            取消
                        </button>
                        <button type="button" className="btn btn-primary"
                            onClick={() => updateProduct(tempData.id)}
                            >
                            確認
                        </button>
                        </>
                    )
                    }
                </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;
