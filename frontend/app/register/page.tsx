"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";
import { setTokens } from "../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {   
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      setTokens(data.access_token, data.refresh_token);
      router.push("/login");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1200px]">
        {/* Left Side */}
        <div className="hidden flex-1 flex-col justify-center border-r border-stone-100 px-16 lg:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <path d="M2 3h12v7a2 2 0 01-2 2H6l-3 2v-2H2V3z" />
              </svg>
            </div>

            <span className="text-xl font-medium">Convo</span>
          </div>

          <h1 className="mb-4 text-5xl leading-tight tracking-tight text-stone-900">
            Start your
            <br />
            conversations.
          </h1>

          <p className="mb-10 max-w-md text-lg leading-8 text-stone-500">
            Create your account, join rooms, send direct messages,
            and chat in real time.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-violet-600" />
              <span className="text-stone-700">
                Create rooms instantly
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-violet-600" />
              <span className="text-stone-700">
                Secure authentication
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-violet-600" />
              <span className="text-stone-700">
                Real-time messaging
              </span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
                Create account
              </div>

              <h2 className="mb-2 text-3xl font-semibold tracking-tight text-stone-900">
                Join Convo
              </h2>

              <p className="text-stone-500">
                Create your account and start chatting.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="ashutosh"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-violet-600 hover:text-violet-700"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}