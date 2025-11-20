import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});
// Add a request interceptor
api.interceptors.request.use(
  async function (config) {
    // chạy trước khi call api
    console.log("Start Request", config);

    const token = await AsyncStorage.getItem("token");

    // set token cho api
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    console.log("REQUEST ERROR", error);
    return Promise.reject(error);
  }
);


export const apiNoToken = axios.create(({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
}))
export default api;

