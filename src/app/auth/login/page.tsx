// app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInAction(username, password);
      if (result) {
        router.push("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-dark text-white rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-dark text-white rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand text-white py-2 rounded hover:bg-brand-dark transition"
          >
            Login
          </button>
        </form>
        <p className="text-white mt-4">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-brand hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}