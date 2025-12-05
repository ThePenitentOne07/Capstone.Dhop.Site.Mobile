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

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    // Log successful responses
    console.log("Response:", {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  function (error) {
    // Log response errors
    if (error.response) {
      console.log("RESPONSE ERROR:", {
        url: error.response.config?.url,
        method: error.response.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.log("RESPONSE ERROR (no response):", error.message || error);
    }
    return Promise.reject(error);
  }
);


export const apiNoToken = axios.create(({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
}))
export default api;

