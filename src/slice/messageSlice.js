import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const messageSlice = createSlice({
  name: "message",
  // 訊息陣列，可同時存在多筆提示
  initialState: [
    // {
    //   id: "1",
    //   type: "success",
    //   title: "測試訊息",
    //   text: "這是一則測試訊息，會在 2 秒後消失",
    // },
  ],
  reducers: {
    // 新增訊息，根據 payload 的 success 屬性決定訊息類型和標題
    createMessage: (state, action) => {
      state.push({
        id: action.payload.id,
        type: action.payload.success ? "success" : "danger", // 根據 success 決定樣式顏色
        title: action.payload.success ? "成功" : "失敗",
        text: action.payload.message,
      });
    },
    // 根據 ID 移除特定訊息
    removeMessage: (state, action) => {
      const index = state.findIndex((message) => message.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  },
});     

// 非同步 Thunk：發送訊息後，設定 2 秒鐘後自動觸發移除動作
export const createAsyncMessage = createAsyncThunk(
    'message/createAsyncMessage',
    async (payload, { dispatch, requestId }) => {
      const id = requestId; // 使用內建的 requestId 保證每則訊息 ID 唯一
      dispatch(
        createMessage({
          ...payload,
          id,
        }),
      );

      setTimeout(() => {
        dispatch(removeMessage(id));
      }, 2000);
    },
);


const { createMessage, removeMessage } = messageSlice.actions;

export default messageSlice.reducer;
