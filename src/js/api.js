import { API_URL } from "./state.js";

export const fetchUsersApi = () =>
    fetch(API_URL).then(res => res.json());

export const addUserApi = data =>
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const updateUserApi = (id, data) =>
    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const deleteUserApi = id =>
    fetch(`${API_URL}/${id}`, { method: "DELETE" });
