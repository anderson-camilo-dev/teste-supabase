"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [cpf, setCpf] = useState("");

  // Endereço
  const [rua, setRua] = useState("");
  const [numeroCasa, setNumeroCasa] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");

  const [error, setError] = useState("");
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExists(false);
    setLoading(true);

    // Valida campos
    if (!name || !email || !password || !role) {
      setError("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (role === "medico") {
      if (!cpf || !rua || !numeroCasa || !bairro || !cidade) {
        setError("Preencha todos os dados do médico.");
        setLoading(false);
        return;
      }

      if (cpf.replace(/\D/g, "").length !== 11) {
        setError("CPF inválido.");
        setLoading(false);
        return;
      }

      const { data: existingCpf } = await supabase
        .from("users")
        .select("id")
        .eq("cpf", cpf.replace(/\D/g, ""))
        .single();

      if (existingCpf) {
        setError("CPF já cadastrado.");
        setLoading(false);
        return;
      }
    }

    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      setError("Email já cadastrado.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      name,
      email,
      role,
      password,
      cpf: role === "medico" ? cpf.replace(/\D/g, "") : null,
      rua: role === "medico" ? rua : null,
      numero_casa: role === "medico" ? numeroCasa : null,
      bairro: role === "medico" ? bairro : null,
      cidade: role === "medico" ? cidade : null,
    });

    if (insertError) {
      console.error(insertError);
      setError("Erro ao cadastrar usuário.");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  function formatCpf(value: string) {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d+)/, "$1.$2");
    if (numbers.length <= 9)
      return numbers.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");

    return numbers.replace(
      /(\d{3})(\d{3})(\d{3})(\d+)/,
      "$1.$2.$3-$4"
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-purple-900">
      <Link
  href="/"
  className="
    fixed top-6 left-6 z-50
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    bg-black/60
    border border-purple-700/40
    text-purple-300
    hover:bg-purple-700/20
    transition
  "
>
  <span className="text-lg">←</span>
  Voltar
</Link>

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
          disabled={loading}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
        />

        <input
          required
          type="email"
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

        <select
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
        >
          <option value="">Selecione o cargo</option>
          <option value="user">Usuário</option>
          <option value="medico">Médico</option>
          <option value="secretaria">Secretária</option>
        </select>

        {role === "medico" && (
          <>
            <input
              value={cpf}
              maxLength={14}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="CPF"
              disabled={loading}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
            />

            <input
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Rua"
              disabled={loading}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
            />

            <input
              value={numeroCasa}
              onChange={(e) => setNumeroCasa(e.target.value)}
              placeholder="Número da casa"
              disabled={loading}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
            />

            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Bairro"
              disabled={loading}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
            />

            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              disabled={loading}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white disabled:opacity-50"
            />
          </>
        )}

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl text-white font-semibold
            bg-purple-600 hover:bg-purple-700
            transition flex items-center justify-center gap-2
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading && (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </main>
  );
}
