// lib/axios.ts
import axios from "axios";
import https from "https";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance with your database connection parameters
const api = axios.create({
  baseURL: BASE_URL, 
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Only if you need to bypass SSL verification
  }),
});

export default api;
