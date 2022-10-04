import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "artist-explorer-production.up.railway.app"
})

export default axiosInstance
