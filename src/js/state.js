export const API_URL = "https://jsonplaceholder.typicode.com/users";

export let users = [];
export let editingUserId = null;

export function setUsers(data) {
    users = data;
}

export function setEditingUserId(id) {
    editingUserId = id;
}
