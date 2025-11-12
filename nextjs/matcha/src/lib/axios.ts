import axios from 'axios';

// Create an Axios instance with credentials enabled
const axiosInstance = axios.create({
  withCredentials: true, // This is the key setting to include cookies
});

export default axiosInstance;
