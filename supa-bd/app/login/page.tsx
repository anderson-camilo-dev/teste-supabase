"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .select("email,password,role")
      .eq("email", email)
      .single();

    if (!data) {
      setError("Email não encontrado");
      return;
    }

    if (data.password !== password) {
      setError("Senha incorreta");
      return;
    }

    // ✅ VERIFICAÇÃO DE ADMIN
    if (data.role === "admin") {
      router.push("/users");
      return;
    }

    // Usuário comum
    router.push("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-black/70 border border-purple-700/40 rounded-2xl">
        <h2 className="text-3xl text-purple-400 font-bold mb-6 text-center">
          Login
        </h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}
            <Link className="pl-1 text-purple-600" href="/singUp">Registrar-se</Link></p>}

        <button className="w-full py-3 bg-purple-600 rounded-xl text-white font-semibold">
          Entrar
        </button>
      </form>
    </main>
  );
}
