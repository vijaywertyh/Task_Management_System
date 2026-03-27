import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

export const getUsers = async (token) => {
  const response = await API.get("/users/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};