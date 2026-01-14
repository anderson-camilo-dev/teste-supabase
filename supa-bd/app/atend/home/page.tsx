"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNav from "@/app/components/HeaderAtend";

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
const hours = Array.from(
  { length: 11 },
  (_, i) => `${String(i + 9).padStart(2, "0")}:00`
);

function formatCPF(value: string) {
  value = value.replace(/\D/g, "").substring(0, 11);
  if (value.length > 9)
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
  if (value.length > 6)
    return value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
  if (value.length > 3) return value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
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
function MiniCalendar({
  selectedDate,
  markedDates,
  onSelect,
}: {
  selectedDate: string;
  markedDates: string[];
  onSelect: (date: string) => void;
}) {
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
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          ←
        </button>
        <span className="font-semibold capitalize">{monthName}</span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-500">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            {d && (
              <button
                onClick={() => onSelect(d.dateStr)}
                className={`w-8 h-8 rounded-full text-sm
                  ${
                    d.dateStr === selectedDate
                      ? "bg-gray-800 text-white"
                      : markedDates.includes(d.dateStr)
                      ? "bg-gray-400/50"
                      : "hover:bg-gray-200"
                  }`}
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
   Página Home Atendente
===================== */
export default function HomePage() {
  const [date, setDate] = useState(todayStr());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [form, setForm] = useState({
    title: "",
    client: "",
    cpf: "",
    doctorId: "",
    hour: "",
  });

  async function fetchDoctors() {
    setLoadingDoctors(true);

    const { data } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "medico")
      .order("name");

    setDoctors(data || []);
    setLoadingDoctors(false);
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

    const cleanCpf = form.cpf.replace(/\D/g, "");

    // 🔎 verifica se CPF existe
    const { data: userExists } = await supabase
      .from("users")
      .select("id")
      .eq("cpf", cleanCpf)
      .single();

    if (!userExists) {
      alert("CPF não encontrado. O usuário precisa estar cadastrado.");
      return;
    }

    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!doctor) return;

    const { error } = await supabase.from("scheduling").insert({
      cpf: cleanCpf,
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
    <main className="min-h-screen bg-gray-50">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-4xl font-bold">Agenda de Consultas</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-semibold mb-4">Médicos</h2>
            {doctors.map((doc) => (
              <div key={doc.id} className="p-2 bg-gray-100 rounded mb-2">
                Dr(a) {doc.name}
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow space-y-4">
            <MiniCalendar
              selectedDate={date}
              markedDates={markedDates}
              onSelect={setDate}
            />

            <input
              placeholder="Título da consulta"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 rounded"
            />

            <input
              placeholder="Nome do cliente"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 rounded"
            />

            <input
              placeholder="CPF"
              value={form.cpf}
              onChange={(e) =>
                setForm({ ...form, cpf: formatCPF(e.target.value) })
              }
              className="w-full px-4 py-3 bg-gray-100 rounded"
            />

            <select
              value={form.doctorId}
              onChange={(e) =>
                setForm({ ...form, doctorId: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-100 rounded"
            >
              <option value="">Selecione o médico</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={form.hour}
              onChange={(e) => setForm({ ...form, hour: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 rounded"
            >
              <option value="">Horário</option>
              {hours.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>

            <button
              onClick={addAppointment}
              className="w-full py-3 bg-purple-800 text-white rounded-lg font-semibold"
            >
              Adicionar Consulta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
