// lib/axios.ts
import axios from "axios";
import https from "https";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://testharis.madjria.com/api`
    : `http://localhost:3000/api`;

// Create axios instance with your database connection parameters
const api = axios.create({
  baseURL: BASE_URL, // Your MySQL host
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Only if you need to bypass SSL verification
  }),
});

export default api;
