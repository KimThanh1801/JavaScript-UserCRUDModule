export const validation = {
    name: { required: true, minLength: 3, maxLength: 50, message: "Name must be 3-50 characters and contain only letters" },
    username: { required: true, minLength: 3, maxLength: 20, message: "Username must be 3-20 characters (letters, numbers, underscore only)" },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
    phone: {
        required: true,
        pattern: /^(03|05|07|08|09)\d{8}$/, // Bắt đầu 03,05,07,08,09 + 8 chữ số nữa = 10 số
        message: "Số điện thoại không hợp lệ, phải bắt đầu 03,05,07,08,09 và đủ 10 chữ số"
    },
    website: { required: false, pattern: /^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/, message: "Please enter a valid website (e.g., example.com)" },
};
export function validateField(name, value) {
    const rule = validation[name];
    const errorEl = document.getElementById(name + "Error");
    errorEl.textContent = ""; // reset lỗi trước

    if (rule.required && !value.trim()) {
        errorEl.textContent = "Trường này bắt buộc";
        return false;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
        errorEl.textContent = rule.message;
        return false;
    }

    // Kiểm tra riêng cho phone: đúng 10 chữ số
    if (name === "phone") {
        const digitCount = value.replace(/\D/g, "").length; // loại bỏ tất cả ký tự không phải số
        if (digitCount !== 10) { // === 10 thì hợp lệ, khác 10 thì fail
            errorEl.textContent = rule.message;
            return false;
        }
    }

    if (rule.minLength && value.length < rule.minLength) {
        errorEl.textContent = rule.message;
        return false;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
        errorEl.textContent = rule.message;
        return false;
    }

    return true;
}
