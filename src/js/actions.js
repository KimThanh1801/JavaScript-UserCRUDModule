import { users, setEditingUserId } from "./state.js";
import { renderUsers } from "./ui.js";

export function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setEditingUserId(id);

    document.getElementById("name").value = user.name;
    document.getElementById("username").value = user.username;
    document.getElementById("email").value = user.email;
    document.getElementById("phone").value = user.phone;
    document.getElementById("website").value = user.website;

    modalTitle.textContent = "Edit User";
    submitBtnText.textContent = "Update User";

    userModal.classList.remove("hidden");
}


export function showDeleteConfirmation(id) {
    setEditingUserId(id);

    deleteUserInfo.textContent = `User ID: ${id}`;
    deleteModal.classList.remove("hidden");
}


window.editUser = editUser;
window.showDeleteConfirmation = showDeleteConfirmation;
