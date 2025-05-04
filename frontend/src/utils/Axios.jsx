import axios from "axios";

const Axios = axios.create({
  // baseURL: "https://ec2-13-48-178-249.eu-north-1.compute.amazonaws.com/",
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default Axios;
