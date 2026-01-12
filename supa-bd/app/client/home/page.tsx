"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/app/components/Modal";
import Link from "next/link";

/* =====================
   Tipagens
===================== */
interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  title: string;
  client: string;
  doctorId: string;
  doctorName: string;
  hour: string;
  date: string;
}

/* =====================
   Utilidades
===================== */
const hours = Array.from({ length: 11 }, (_, i) =>
  `${String(i + 9).padStart(2, "0")}:00`
);

function formatCPF(value: string) {
  value = value.replace(/\D/g, "").substring(0, 11);
  if (value.length > 9)
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
  if (value.length > 6)
    return value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
  if (value.length > 3)
    return value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
  return value;
}

function isValidCPF(cpf: string) {
  return /^\d{11}$/.test(cpf.replace(/\D/g, ""));
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/* =====================
   Mini Calendário
===================== */
function MiniCalendar({ selectedDate, markedDates, onSelect }: any) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    const day = i - firstDay + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return { day, dateStr };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="px-3 py-1 rounded-lg bg-purple-800/40 text-purple-300"
        >
          ←
        </button>

        <span className="text-purple-300 font-semibold capitalize">
          {monthName}
        </span>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="px-3 py-1 rounded-lg bg-purple-800/40 text-purple-300"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            {d && (
              <button
                onClick={() => onSelect(d.dateStr)}
                className={`w-9 h-9 rounded-full text-sm
                  ${
                    d.dateStr === selectedDate
                      ? "bg-purple-600 text-white"
                      : ""
                  }
                  ${
                    markedDates.includes(d.dateStr) &&
                    d.dateStr !== selectedDate
                      ? "bg-purple-900 text-white"
                      : ""
                  }
                `}
              >
                {d.day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================
   Página Home
===================== */
export default function HomePage() {
  const [date, setDate] = useState(todayStr());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [form, setForm] = useState({
    title: "",
    client: "",
    cpf: "",
    doctorId: "",
    hour: "",
  });

  async function fetchDoctors() {
    const { data } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "medico")
      .order("name");

    setDoctors(data || []);
  }

  async function fetchAppointments() {
    const { data } = await supabase
      .from("scheduling")
      .select("*")
      .order("date")
      .order("hour");

    if (!data) return;

    setAppointments(
      data.map((a: any) => ({
        id: a.id,
        title: a.title,
        client: a.patient_name,
        doctorId: a.doctor_id,
        doctorName: a.doctor_name,
        hour: a.hour,
        date: a.date,
      }))
    );
  }

  async function addAppointment() {
    if (
      !form.title ||
      !form.client ||
      !form.cpf ||
      !form.doctorId ||
      !form.hour
    ) {
      alert("Preencha todos os campos");
      return;
    }

    if (!isValidCPF(form.cpf)) {
      alert("CPF inválido");
      return;
    }

    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!doctor) return;

    const { error } = await supabase.from("scheduling").insert({
      cpf: form.cpf,
      patient_name: form.client,
      title: form.title,
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      date,
      hour: form.hour,
    });

    if (error) {
      if (error.code === "23505")
        alert("⚠️ Horário já ocupado para este médico");
      else console.error(error);
      return;
    }

    setForm({ title: "", client: "", cpf: "", doctorId: "", hour: "" });
    fetchAppointments();
  }

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const markedDates = Array.from(new Set(appointments.map((a) => a.date)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-10">
      <div className="grid grid-cols-2 mb-6">
        <h1 className="text-3xl font-bold text-purple-400">
          Agenda de Consultas
        </h1>
        <Link href="/login" className="justify-self-end text-purple-300">
          Sair
        </Link>
      </div>

      <div className="grid lg:grid-cols-6 gap-6">
        {/* Médicos */}
        <div className="bg-black/70 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl text-purple-400 mb-4">Médicos</h2>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-black/60 border border-purple-600/30 text-white mb-2"
            >
              Dr(a) {doc.name}
            </div>
          ))}
        </div>

        {/* Nova Consulta */}
        <div className="col-span-3 bg-black/70 border border-purple-700/40 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl text-purple-400">Nova Consulta</h2>

          <MiniCalendar
            selectedDate={date}
            markedDates={markedDates}
            onSelect={setDate}
          />

          <input
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            placeholder="Título da consulta"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            placeholder="Nome do cliente"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />

          <input
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            placeholder="CPF"
            value={form.cpf}
            onChange={(e) =>
              setForm({ ...form, cpf: formatCPF(e.target.value) })
            }
          />

          <select
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          >
            <option value="">Selecione o médico</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            value={form.hour}
            onChange={(e) => setForm({ ...form, hour: e.target.value })}
          >
            <option value="">Horário</option>
            {hours.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          <button
            onClick={addAppointment}
            className="w-full py-3 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700"
          >
            Adicionar Consulta
          </button>
        </div>
      </div>
    </main>
  );
}
