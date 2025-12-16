// API Base URL
const API_URL = "https://jsonplaceholder.typicode.com/users";

// State
let users = [];
let editingUserId = null;

// DOM Elements
const userTable = document.getElementById("userTable");
const userTableBody = document.getElementById("userTableBody");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const addUserBtn = document.getElementById("addUserBtn");
const userModal = document.getElementById("userModal");
const deleteModal = document.getElementById("deleteModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const submitBtnText = document.getElementById("submitBtnText");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const closeDeleteModal = document.getElementById("closeDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteUserInfo = document.getElementById("deleteUserInfo");
const userCount = document.getElementById("userCount");
const searchInput = document.getElementById("searchInput");

// Validation Rules
const validation = {
    name: { required: true, minLength: 3, maxLength: 50, message: "Name must be 3-50 characters and contain only letters" },
    username: { required: true, minLength: 3, maxLength: 20, message: "Username must be 3-20 characters (letters, numbers, underscore only)" },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address" },
    phone: { required: true, pattern: /^[\d\s\-+$$$$]+$/, minLength: 10, message: "Please enter a valid phone number (at least 10 digits)" },
    website: { required: false, pattern: /^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/, message: "Please enter a valid website (e.g., example.com)" },
};

// Initialize App
async function init() {
    await fetchUsers();
    setupEventListeners();
}

// Fetch Users
async function fetchUsers() {
    try {
        loading.classList.remove("hidden");
        errorDiv.classList.add("hidden");
        userTable.classList.add("hidden");

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        users = await response.json();
        renderUsers(users);

        loading.classList.add("hidden");
        userTable.classList.remove("hidden");
    } catch (error) {
        console.error("Error fetching users:", error);
        showError("Failed to load users. Please try again later.");
        loading.classList.add("hidden");
    }
}

// Render Users
function renderUsers(list = users) {
    userTableBody.innerHTML = "";
    if (!list.length) {
        userTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No users found</td></tr>`;
    } else {
        list.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.website || "-"}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success" onclick="editUser(${user.id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger" onclick="showDeleteConfirmation(${user.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }
    userCount.textContent = `(${list.length} users)`;
}

// Show Error
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
}

// Validate Form
function validateField(fieldName, value) {
    const rules = validation[fieldName];
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName);

    errorElement.textContent = "";
    inputElement.classList.remove("error");

    if (rules.required && !value.trim()) {
        errorElement.textContent = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        inputElement.classList.add("error");
        return false;
    }
    if (!rules.required && !value.trim()) return true;
    if (rules.minLength && value.length < rules.minLength) { errorElement.textContent = rules.message; inputElement.classList.add("error"); return false; }
    if (rules.maxLength && value.length > rules.maxLength) { errorElement.textContent = rules.message; inputElement.classList.add("error"); return false; }
    if (rules.pattern && !rules.pattern.test(value)) { errorElement.textContent = rules.message; inputElement.classList.add("error"); return false; }

    return true;
}

function validateForm() {
    let isValid = true;
    ["name", "username", "email", "phone", "website"].forEach(field => {
        if (!validateField(field, document.getElementById(field).value)) isValid = false;
    });
    return isValid;
}

// Modal Functions
function openAddModal() {
    editingUserId = null;
    modalTitle.textContent = "Add New User";
    submitBtnText.textContent = "Add User";
    userForm.reset();
    clearFormErrors();
    userModal.classList.remove("hidden");
}

function editUser(userId) {
    editingUserId = userId;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    modalTitle.textContent = "Edit User";
    submitBtnText.textContent = "Update User";
    ["name", "username", "email", "phone", "website"].forEach(field => {
        document.getElementById(field).value = user[field] || "";
    });
    clearFormErrors();
    userModal.classList.remove("hidden");
}

function clearFormErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
    document.querySelectorAll("input").forEach(el => el.classList.remove("error"));
}

function closeUserModal() {
    userModal.classList.add("hidden");
    userForm.reset();
    clearFormErrors();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = {};
    ["name", "username", "email", "phone", "website"].forEach(f => formData[f] = document.getElementById(f).value.trim());

    if (editingUserId) await updateUser(editingUserId, formData);
    else await addUser(formData);
}

// Add / Update / Delete User
async function addUser(userData) {
    try {
        const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userData) });
        if (!response.ok) throw new Error("Failed to add user");

        const newUser = await response.json();
        newUser.id = users.length + 1;
        users.push(newUser);
        renderUsers();
        closeUserModal();
        alert("User added successfully!");
    } catch (error) {
        console.error(error);
        alert("Failed to add user. Please try again.");
    }
}

// Update User
async function updateUser(userId, userData) {
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Failed to update user");

        users = users.map(u => u.id === userId ? { ...u, ...userData } : u);
        renderUsers();
        closeUserModal();
        alert("User updated successfully!");
    } catch (error) {
        console.error("Error updating user:", error);
        alert("Failed to update user. Please try again.");
    }
}


function showDeleteConfirmation(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    deleteUserInfo.textContent = `${user.name} (${user.email})`;
    deleteModal.classList.remove("hidden");

    confirmDeleteBtn.onclick = () => deleteUser(userId);
}

function closeDeleteModalFunc() {
    deleteModal.classList.add("hidden");
    confirmDeleteBtn.onclick = null;
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete user");

        users = users.filter(u => u.id !== userId);
        renderUsers();
        closeDeleteModalFunc();
        alert("User deleted successfully!");
    } catch (error) {
        console.error(error);
        alert("Failed to delete user. Please try again.");
    }
}

// Event Listeners
function setupEventListeners() {
    addUserBtn.addEventListener("click", openAddModal);
    closeModal.addEventListener("click", closeUserModal);
    cancelBtn.addEventListener("click", closeUserModal);
    closeDeleteModal.addEventListener("click", closeDeleteModalFunc);
    cancelDeleteBtn.addEventListener("click", closeDeleteModalFunc);
    userForm.addEventListener("submit", handleFormSubmit);

    ["name", "username", "email", "phone", "website"].forEach(field => {
        document.getElementById(field).addEventListener("blur", e => validateField(field, e.target.value));
    });

    userModal.addEventListener("click", e => { if (e.target === userModal) closeUserModal(); });
    deleteModal.addEventListener("click", e => { if (e.target === deleteModal) closeDeleteModalFunc(); });

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        renderUsers(users.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)));
    });
}

// Make functions global for onclick
window.editUser = editUser;
window.showDeleteConfirmation = showDeleteConfirmation;

// Start app
document.addEventListener("DOMContentLoaded", init);
