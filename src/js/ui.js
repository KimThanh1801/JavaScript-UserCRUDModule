import { users } from "./state.js";
import { userTableBody, userCount } from "./dom.js";

export function renderUsers(list = users) {
    userTableBody.innerHTML = "";

    if (!list.length) {
        userTableBody.innerHTML = `<tr><td colspan="7">No users</td></tr>`;
        return;
    }

    list.forEach(u => {
        userTableBody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.website || "-"}</td>
                <td>
                  <button class="btn btn-success" onclick="editUser(${u.id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger" onclick="showDeleteConfirmation(${u.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                </td>
            </tr>
        `;
    });

    userCount.textContent = `(${list.length} users)`;
}
