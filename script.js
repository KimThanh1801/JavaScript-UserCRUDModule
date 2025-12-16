// API Base URL
const API_URL = "https://jsonplaceholder.typicode.com/users"

// State
let users = []
let editingUserId = null

// DOM Elements
const userTable = document.getElementById("userTable")
const userTableBody = document.getElementById("userTableBody")
const loading = document.getElementById("loading")
const errorDiv = document.getElementById("error")
const addUserBtn = document.getElementById("addUserBtn")
const userModal = document.getElementById("userModal")
const deleteModal = document.getElementById("deleteModal")
const userForm = document.getElementById("userForm")
const modalTitle = document.getElementById("modalTitle")
const submitBtnText = document.getElementById("submitBtnText")
const closeModal = document.getElementById("closeModal")
const cancelBtn = document.getElementById("cancelBtn")
const closeDeleteModal = document.getElementById("closeDeleteModal")
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn")
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
const deleteUserInfo = document.getElementById("deleteUserInfo")
const userCount = document.getElementById("userCount")


// Validation Rules
const validation = {
    name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        message: "Name must be 3-50 characters and contain only letters",
    },
    username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        message: "Username must be 3-20 characters (letters, numbers, underscore only)",
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
    },
    phone: {
        required: true,
        pattern: /^[\d\s\-+$$$$]+$/,
        minLength: 10,
        message: "Please enter a valid phone number (at least 10 digits)",
    },
    website: {
        required: false,
        pattern: /^[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}$/,
        message: "Please enter a valid website (e.g., example.com)",
    },
}

// Initialize App
async function init() {
    await fetchUsers()
    setupEventListeners()
}

// Fetch Users from API
async function fetchUsers() {
    try {
        loading.classList.remove("hidden")
        errorDiv.classList.add("hidden")
        userTable.classList.add("hidden")

        const response = await fetch(API_URL)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        users = await response.json()
        renderUsers()

        loading.classList.add("hidden")
        userTable.classList.remove("hidden")
    } catch (error) {
        console.error("Error fetching users:", error)
        showError("Failed to load users. Please try again later.")
        loading.classList.add("hidden")
    }
}

// Render Users Table
function renderUsers() {
    userTableBody.innerHTML = ""

    users.forEach((user) => {
        const row = document.createElement("tr")
        row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.website || "-"}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-success" onclick="editUser(${user.id})">Edit</button>
          <button class="btn btn-danger" onclick="showDeleteConfirmation(${user.id})">Del</button>
        </div>
      </td>
    `
        userTableBody.appendChild(row)
    })
}

// Show Error Message
function showError(message) {
    errorDiv.textContent = message
    errorDiv.classList.remove("hidden")
}

// Validate Single Field
function validateField(fieldName, value) {
    const rules = validation[fieldName]
    const errorElement = document.getElementById(`${fieldName}Error`)
    const inputElement = document.getElementById(fieldName)

    // Clear previous error
    errorElement.textContent = ""
    inputElement.classList.remove("error")

    // Check if required
    if (rules.required && !value.trim()) {
        errorElement.textContent = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
        inputElement.classList.add("error")
        return false
    }

    // Skip validation if field is not required and empty
    if (!rules.required && !value.trim()) {
        return true
    }

    // Check min length
    if (rules.minLength && value.length < rules.minLength) {
        errorElement.textContent = rules.message
        inputElement.classList.add("error")
        return false
    }

    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
        errorElement.textContent = rules.message
        inputElement.classList.add("error")
        return false
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
        errorElement.textContent = rules.message
        inputElement.classList.add("error")
        return false
    }

    return true
}

// Validate All Fields
function validateForm() {
    let isValid = true

    const formData = {
        name: document.getElementById("name").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        website: document.getElementById("website").value,
    }

    for (const [field, value] of Object.entries(formData)) {
        if (!validateField(field, value)) {
            isValid = false
        }
    }

    return isValid
}

// Open Modal for Adding User
function openAddModal() {
    editingUserId = null
    modalTitle.textContent = "Add New User"
    submitBtnText.textContent = "Add User"
    userForm.reset()
    clearFormErrors()
    userModal.classList.remove("hidden")
}

// Open Modal for Editing User
function editUser(userId) {
    editingUserId = userId
    const user = users.find((u) => u.id === userId)

    if (!user) return

    modalTitle.textContent = "Edit User"
    submitBtnText.textContent = "Update User"

    document.getElementById("name").value = user.name
    document.getElementById("username").value = user.username
    document.getElementById("email").value = user.email
    document.getElementById("phone").value = user.phone
    document.getElementById("website").value = user.website || ""

    clearFormErrors()
    userModal.classList.remove("hidden")
}

// Clear Form Errors
function clearFormErrors() {
    const errorElements = document.querySelectorAll(".error-message")
    errorElements.forEach((el) => (el.textContent = ""))

    const inputElements = document.querySelectorAll("input")
    inputElements.forEach((el) => el.classList.remove("error"))
}

// Close Modal
function closeUserModal() {
    userModal.classList.add("hidden")
    userForm.reset()
    clearFormErrors()
}

// Submit Form (Add or Update)
async function handleFormSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
        return
    }

    const formData = {
        name: document.getElementById("name").value.trim(),
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        website: document.getElementById("website").value.trim(),
    }

    if (editingUserId) {
        await updateUser(editingUserId, formData)
    } else {
        await addUser(formData)
    }
}

// Add User
async function addUser(userData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        })

        if (!response.ok) {
            throw new Error("Failed to add user")
        }

        const newUser = await response.json()

        // JSONPlaceholder returns id 11, but we'll add it to our local array
        newUser.id = users.length + 1
        users.push(newUser)

        renderUsers()
        closeUserModal()
        alert("User added successfully!")
    } catch (error) {
        console.error("Error adding user:", error)
        alert("Failed to add user. Please try again.")
    }
}

async function updateUserCount() {
    userCount.textContent = `(${users.length} users)`
}


async function renderUsers() {
    userTableBody.innerHTML = ""

    users.forEach((user) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${user.website || "-"}</td>
              <td>
  <div class="action-buttons">
    <button
      class="btn btn-success"
      onclick="editUser(${user.id})"
      title="Edit"
    >
      <i class="fa-solid fa-pen-to-square"></i>
    </button>

    <button
      class="btn btn-danger"
      onclick="showDeleteConfirmation(${user.id})"
      title="Delete"
    >
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
</td>
        `
        userTableBody.appendChild(row)
    })

    // ✅ cập nhật tổng user
    updateUserCount()
}

// Show Delete Confirmation
function showDeleteConfirmation(userId) {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    deleteUserInfo.textContent = `${user.name} (${user.email})`
    deleteModal.classList.remove("hidden")

    // Store userId for confirmation
    confirmDeleteBtn.onclick = () => deleteUser(userId)
}

// Close Delete Modal
function closeDeleteModalFunc() {
    deleteModal.classList.add("hidden")
    confirmDeleteBtn.onclick = null
}

// Delete User
async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            throw new Error("Failed to delete user")
        }

        // Remove from local array
        users = users.filter((u) => u.id !== userId)

        renderUsers()
        closeDeleteModalFunc()
        alert("User deleted successfully!")
    } catch (error) {
        console.error("Error deleting user:", error)
        alert("Failed to delete user. Please try again.")
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Add User Button
    addUserBtn.addEventListener("click", openAddModal)

    // Close Modal Buttons
    closeModal.addEventListener("click", closeUserModal)
    cancelBtn.addEventListener("click", closeUserModal)

    // Delete Modal
    closeDeleteModal.addEventListener("click", closeDeleteModalFunc)
    cancelDeleteBtn.addEventListener("click", closeDeleteModalFunc)

    // Form Submit
    userForm.addEventListener("submit", handleFormSubmit)

    // Real-time Validation
    const inputs = ["name", "username", "email", "phone", "website"]
    inputs.forEach((inputName) => {
        const input = document.getElementById(inputName)
        input.addEventListener("blur", (e) => {
            validateField(inputName, e.target.value)
        })
    })

    // Close modals on outside click
    userModal.addEventListener("click", (e) => {
        if (e.target === userModal) {
            closeUserModal()
        }
    })

    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
            closeDeleteModalFunc()
        }
    })
}

// Make functions global for onclick handlers
window.editUser = editUser
window.showDeleteConfirmation = showDeleteConfirmation

// Start the app
document.addEventListener("DOMContentLoaded", () => {
    init()
})
