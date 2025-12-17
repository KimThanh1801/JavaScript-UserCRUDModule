import {
    addUserBtn,
    closeModal,
    cancelBtn,
    closeDeleteModal,
    cancelDeleteBtn,
    userForm,
    userModal,
    deleteModal,
    searchInput
} from "./dom.js";
import { showToast } from "./toast.js";
import { users, editingUserId, setUsers } from "./state.js";
import { addUserApi, updateUserApi } from "./api.js";
import { renderUsers } from "./ui.js";
import { validateField } from "./validation.js";
import { openAddModal } from "./modal.js";

export function setupEventListeners() {
    addUserBtn.addEventListener("click", openAddModal);

    closeModal.addEventListener("click", () => userModal.classList.add("hidden"));
    cancelBtn.addEventListener("click", () => userModal.classList.add("hidden"));
    closeDeleteModal.addEventListener("click", () => deleteModal.classList.add("hidden"));
    cancelDeleteBtn.addEventListener("click", () => deleteModal.classList.add("hidden"));

    userForm.addEventListener("submit", async e => {
        e.preventDefault();

        const data = {};
        const fields = ["name", "username", "email", "phone", "website"];

        for (const f of fields) {
            data[f] = document.getElementById(f).value.trim();
            if (!validateField(f, data[f])) return;
        }

        try {
            if (editingUserId !== null) {
                await updateUserApi(editingUserId, data);
                setUsers(users.map(u => u.id === editingUserId ? { ...u, ...data } : u));
                showToast("Cập nhật user thành công"); // Thêm thông báo update
            } else {
                const res = await addUserApi(data);
                const newUser = await res.json();
                setUsers([...users, newUser]);
                showToast("Thêm user thành công"); // Thêm thông báo thêm mới
            }

            renderUsers();
            userModal.classList.add("hidden");
        } catch (err) {
            console.error(err);
            showToast("Có lỗi xảy ra", "error"); // Thêm thông báo lỗi nếu có
        }
    });

    searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase();
        renderUsers(users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        ));
    });
}
