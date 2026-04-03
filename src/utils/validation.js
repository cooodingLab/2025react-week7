
export const validateEmail = {
        required: "Email 為必填",
        pattern: {
            value: /^\S+@\S+$/i,
            message: "請輸入有效的 Email 地址",
        },
    };

export const validatePassword = {
    required: "密碼為必填",
    minLength: {
        value: 6,
        message: "密碼至少要6個字元"
    }
};