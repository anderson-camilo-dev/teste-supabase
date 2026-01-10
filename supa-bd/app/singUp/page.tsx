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
  const [error, setError] = useState("");
  const [exists, setExists] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExists(false);

    // 🔒 Todos obrigatórios
    if (!name || !email || !password || !role || !cpf) {
      setError("Preencha todos os campos.");
      return;
    }

    // Validar CPF (apenas números, tamanho 11)
    const cpfNumbers = cpf.replace(/\D/g, ""); // remove tudo que não é número
    if (cpfNumbers.length !== 11) {
      setError("CPF inválido.");
      return;
    }

    // 🔍 Verifica email duplicado
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
      role,
      cpf: cpfNumbers,
    });

    if (insertError) {
      setError("Erro ao cadastrar usuário.");
      console.error(insertError);
      return;
    }

    // Redireciona direto para login
    router.push("/login");
  }

  // Função para formatar CPF na tela enquanto digita
  function formatCpf(value: string) {
    const numbers = value.replace(/\D/g, "");
    let formatted = numbers;
    if (numbers.length > 3 && numbers.length <= 6)
      formatted = numbers.replace(/(\d{3})(\d+)/, "$1.$2");
    else if (numbers.length > 6 && numbers.length <= 9)
      formatted = numbers.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    else if (numbers.length > 9)
      formatted = numbers.replace(
        /(\d{3})(\d{3})(\d{3})(\d+)/,
        "$1.$2.$3-$4"
      );
    return formatted;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-purple-900">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md p-8 bg-black/70 border border-purple-700/40 rounded-2xl"
      >
        <h2 className="text-3xl text-purple-400 font-bold mb-6 text-center">
          Criar conta
        </h2>

        {/* Nome */}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {/* Email */}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {/* Senha */}
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {/* CPF */}
        <input
          required
          value={cpf}
          maxLength={14}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          placeholder="CPF"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        />

        {/* Cargo */}
        <select
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
        >
          <option value="">Selecione o cargo</option>
          <option value="user">Usuário</option>
          <option value="medico">Médico</option>
          <option value="secretaria">Secretária</option>
        </select>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        {exists && (
          <p className="text-yellow-400 text-sm mb-3">
            Email já cadastrado.
            <Link
              href="/login"
              className="text-purple-400 pl-1 hover:underline"
            >
              Ir para login
            </Link>
          </p>
        )}

        <button className="w-full py-3 bg-purple-600 rounded-xl text-white font-semibold">
          Registrar
        </button>
      </form>
    </main>
  );
}
