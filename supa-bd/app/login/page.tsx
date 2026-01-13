"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (!data) {
      setError("Email ou senha inválidos");
      setLoading(false);
      return;
    }

    // Redireciona dependendo do papel
    if (data.role === "admin") {
      router.push("/users");
    } else {
      router.push("/client/home");
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
          disabled={loading}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
        />

        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          disabled={loading}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
        />

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <p className="mb-4">
          Não tem uma conta?{" "}
          <Link className="text-purple-400 hover:text-purple-300" href="/singUp">
            Cadastre-se
          </Link>{" "}
          agora!
        </p>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl text-white
            bg-purple-600 hover:bg-purple-700
            transition flex items-center justify-center gap-2
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading && (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
