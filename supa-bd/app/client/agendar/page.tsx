"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNavClient from "@/app/components/HeaderClient";
import { useRouter } from "next/navigation";

/* =====================
   Tipagens
===================== */
interface Doctor {
  id: string;
  name: string;
}

/* =====================
   Horários (hora em hora)
===================== */
const HOURS = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8; // 08:00 às 17:00
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function ClientAgendarPage() {
  const router = useRouter();

  /* =====================
     Sessão manual
  ===================== */
  const [userId, setUserId] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  const [patientName, setPatientName] = useState("");

  /* =====================
     Formulário
  ===================== */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");

  /* =====================
     Dados auxiliares
  ===================== */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================
     Verifica login
  ===================== */
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    const role = localStorage.getItem("user_role");

    if (!id || role !== "user") {
      router.push("/login");
      return;
    }

    setUserId(id);
  }, [router]);

  /* =====================
     Carrega usuário + médicos
  ===================== */
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("cpf, name")
        .eq("id", userId)
        .single();

      if (userError || !userData?.cpf) {
        setError("Erro ao carregar dados do usuário.");
        setLoading(false);
        return;
      }

      setCpf(userData.cpf);
      setPatientName(userData.name);

      const { data: doctorsData } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "medico")
        .order("name");

      setDoctors(doctorsData || []);
      setLoading(false);
    }

    loadData();
  }, [userId]);

  /* =====================
     Criar consulta
  ===================== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description || !doctorId || !date || !hour) {
      setError("Preencha todos os campos.");
      return;
    }

    const doctorName =
      doctors.find((d) => d.id === doctorId)?.name || "";

    const { error: insertError } = await supabase
      .from("scheduling")
      .insert({
        title,
        description,
        doctor_id: doctorId,
        doctor_name: doctorName,
        patient_name: patientName,
        cpf,
        date,
        hour: `${hour}:00`, // TIME (HH:MM:SS)
      });

    if (insertError) {
      console.error(insertError);
      setError("Erro ao agendar consulta.");
      return;
    }

    router.push("/client/home");
  }

  /* =====================
     Loading
  ===================== */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <HeaderNavClient />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </main>
    );
  }

  /* =====================
     Render (PADRÃO HOME)
  ===================== */
  return (
    <main className="min-h-screen bg-gray-50">
      <HeaderNavClient />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6">Agendar Consulta</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow max-w-2xl"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da consulta"
            className="w-full mb-4 border rounded px-3 py-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que você está sentindo"
            className="w-full mb-4 border rounded px-3 py-2"
            rows={4}
          />

          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full mb-4 border rounded px-3 py-2"
          >
            <option value="">Selecione o médico</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mb-4 border rounded px-3 py-2"
          />

          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full mb-4 border rounded px-3 py-2"
          >
            <option value="">Selecione o horário</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Agendar
          </button>
        </form>
      </div>
    </main>
  );
}
