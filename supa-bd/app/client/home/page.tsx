"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNavClient from "@/app/components/HeaderClient";
import { useRouter } from "next/navigation";

/* =====================
   Tipagem
===================== */
interface Scheduling {
  id: string;
  title: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  hour: string;
  rating?: number;
}

/* =====================
   Página de Agendamentos do Cliente
===================== */
export default function ClientSchedulingPage() {
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);

  const router = useRouter();

  /* =====================
     Buscar consultas pelo CPF do usuário logado
  ===================== */
  useEffect(() => {
    async function fetchSchedulings() {
      // 1️⃣ Sessão manual
      const userId = localStorage.getItem("user_id");
      const role = localStorage.getItem("user_role");

      if (!userId || role !== "user") {
        router.push("/login");
        return;
      }

      // 2️⃣ Buscar CPF do usuário
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("cpf")
        .eq("id", userId)
        .single();

      if (userError || !userData?.cpf) {
        console.error("CPF não encontrado para este usuário");
        return;
      }

      // 3️⃣ Buscar consultas pelo CPF
      const { data, error } = await supabase
        .from("scheduling")
        .select("*")
        .eq("cpf", userData.cpf)
        .order("date", { ascending: true })
        .order("hour", { ascending: true });

      if (error) {
        console.error("Erro ao buscar consultas:", error.message);
        return;
      }

      setSchedulings(data || []);
    }

    fetchSchedulings();
  }, [router]);

  /* =====================
     Avaliação
  ===================== */
  async function handleRating(id: string, value: number) {
    const { error } = await supabase
      .from("scheduling")
      .update({ rating: value })
      .eq("id", id);

    if (!error) {
      setSchedulings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, rating: value } : s))
      );
      setEditingId(null);
    } else {
      alert("Erro ao avaliar");
    }
  }

  /* =====================
     Render (INTACTO)
  ===================== */
  return (
    <main className="min-h-screen bg-gray-50">
      <HeaderNavClient />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">Meus Agendamentos</h1>

        {schedulings.length === 0 && (
          <p className="text-gray-500">Você ainda não possui consultas.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedulings.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="text-gray-600">Médico: {s.doctor_name}</p>
                <p className="text-gray-600">
                  {s.date} às {s.hour}
                </p>
              </div>

              <div className="mt-4">
                {editingId === s.id ? (
                  <div className="flex gap-2">
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="border rounded px-2"
                    >
                      <option value={0}>Escolher</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} ⭐
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRating(s.id, rating)}
                      className="bg-purple-900 text-white px-3 rounded"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500px-3 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : s.rating ? (
                  <span className="text-yellow-500 font-semibold">
                    {s.rating} ⭐
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(s.id);
                      setRating(0);
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Avaliar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
