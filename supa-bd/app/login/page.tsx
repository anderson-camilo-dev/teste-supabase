"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (!data) {
      setError("Email ou senha inválidos");
      return;
    }

    if (data.role === "admin") {
      router.push("/users");
    } else {
      alert("Login realizado");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-purple-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-8 bg-black/70 border border-purple-700/40 rounded-2xl"
      >
        <h2 className="text-3xl text-purple-400 font-bold mb-6 text-center">
          Login
        </h2>

        <input
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button className="w-full py-3 bg-purple-600 rounded-xl text-white">
          Entrar
        </button>
      </form>
    </main>
  );
}
