"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExists(false);

    // 🔒 Validação obrigatória
    if (!name || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    // 🔍 Verifica se email já existe
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (data) {
      setExists(true);
      return;
    }

    // ✅ Cadastro
    const { error: insertError } = await supabase.from("users").insert({
      name,
      email,
      password,
      role: "user",
    });

    if (insertError) {
      setError("Erro ao cadastrar usuário.");
      return;
    }

    alert("Usuário cadastrado com sucesso");
    setName("");
    setEmail("");
    setPassword("");
  }

  const isDisabled = !name || !email || !password;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-purple-900">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md p-8 bg-black/70 border border-purple-700/40 rounded-2xl"
      >
        <h2 className="text-3xl text-purple-400 font-bold mb-6 text-center">
          Criar conta
        </h2>

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        <input
          required
          type="email"
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

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        {exists && (
          <p className="text-yellow-400 text-sm mb-3">
            Email já cadastrado. Vá para a página de
            <Link href="/login" className="text-purple-400 pl-1 hover:underline">
              login
            </Link>
            .
          </p>
        )}

        <button
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl font-semibold transition
            ${
              isDisabled
                ? "bg-purple-900 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
        >
          Registrar
        </button>
      </form>
    </main>
  );
}
