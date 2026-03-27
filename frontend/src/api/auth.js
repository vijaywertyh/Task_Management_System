import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

export const loginUser = async (payload) => {
  const response = await API.post("/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await API.post("/auth/register", payload);
  return response.data;
};