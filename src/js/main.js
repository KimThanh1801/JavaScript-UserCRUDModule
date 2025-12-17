import { fetchUsersApi } from "./api.js";
import { setUsers, users } from "./state.js";
import { renderUsers } from "./ui.js";
import { setupEventListeners } from "./events.js";
import { loading, userTable, errorDiv } from "./dom.js";

const rowsPerPage = 5; // số user hiển thị mỗi trang
let currentPage = 1;

// DOM elements phân trang
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchInput");

// Hàm cập nhật trạng thái nút phân trang
function updatePagination(list = users) {
    const totalPages = Math.ceil(list.length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} / ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Hàm render trang hiện tại
function renderPage(list = users) {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    renderUsers(list.slice(start, end));
    updatePagination(list);
}

// Event cho nút prev/next
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(users.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
    }
});

// Event search
searchInput.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
    currentPage = 1; // reset về trang 1 khi search
    renderPage(filtered);
});

// Hàm khởi tạo app
async function init() {
    try {
        loading.classList.remove("hidden");
        userTable.classList.add("hidden");

        const data = await fetchUsersApi();
        setUsers(data);

        loading.classList.add("hidden");
        userTable.classList.remove("hidden");

        setupEventListeners();

        renderPage(); // render lần đầu
    } catch {
        loading.classList.add("hidden");
        errorDiv.textContent = "Failed to load users";
        errorDiv.classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", init);
