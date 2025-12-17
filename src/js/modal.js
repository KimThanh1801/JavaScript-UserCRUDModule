import { users, setUsers, setEditingUserId, editingUserId } from "./state.js";
import {
    userModal,
    deleteModal,
    modalTitle,
    submitBtnText,
    deleteUserInfo
} from "./dom.js";
import { renderUsers } from "./ui.js";
import { deleteUserApi } from "./api.js";
import { showToast } from "./toast.js";

/* =======================
   OPEN ADD MODAL
======================= */
export function openAddModal() {
    setEditingUserId(null);

    modalTitle.textContent = "Add New User";
    submitBtnText.textContent = "Add User";
userForm.reset();
    userModal.classList.remove("hidden");
}

/* =======================
   EDIT USER
======================= */
export function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setEditingUserId(id);

    ["name", "username", "email", "phone", "website"].forEach(f => {
        document.getElementById(f).value = user[f] || "";
    });

    modalTitle.textContent = "Edit User";
    submitBtnText.textContent = "Update User";

    userModal.classList.remove("hidden");
    
}

/* =======================
   SHOW DELETE MODAL
======================= */
export function showDeleteConfirmation(id) {
    setEditingUserId(id);

    const user = users.find(u => u.id === id);
    deleteUserInfo.textContent = user
        ? `${user.name} (${user.email})`
        : `User ID: ${id}`;

    deleteModal.classList.remove("hidden");
}

/* =======================
   DELETE USER
======================= */
export async function deleteUser() {
    try {
        await deleteUserApi(editingUserId);

        setUsers(users.filter(u => u.id !== editingUserId));
        renderUsers();

        deleteModal.classList.add("hidden");
        showToast("Xóa user thành công");
    } catch (err) {
        console.error(err);
        showToast("Xóa user thất bại", "error");
    }
}

/* =======================
   EXPORT GLOBAL (for onclick)
======================= */
window.editUser = editUser;
window.showDeleteConfirmation = showDeleteConfirmation;
window.deleteUser = deleteUser;
