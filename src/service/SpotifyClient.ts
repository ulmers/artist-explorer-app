import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SPOTIFY_BASE_URL
})

export default axiosInstance
