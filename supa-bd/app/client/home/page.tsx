"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNav from "@/app/components/HeaderAnav";

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
      {/* Navegação do mês */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          ←
        </button>
        <span className="text-gray-700 font-semibold capitalize">
          {monthName}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-medium mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            {d && (
              <button
                onClick={() => onSelect(d.dateStr)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition
                  ${
                    d.dateStr === selectedDate
                      ? "bg-gray-800 text-white shadow"
                      : markedDates.includes(d.dateStr)
                      ? "bg-gray-400/50 text-gray-800"
                      : "hover:bg-gray-200"
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

const [doctors, setDoctors] = useState<Doctor[]>([]);
const [loadingDoctors, setLoadingDoctors] = useState(true);

async function fetchDoctors() {
  setLoadingDoctors(true);

  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "medico")
    .order("name");

  if (!error) {
    setDoctors(data || []);
  }

  setLoadingDoctors(false);
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
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Agenda de Consultas
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Médicos */}
          <div className="bg-white col-span-1 border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Médicos disponíveis
            </h2>

            {/* Loading */}
            {loadingDoctors && (
              <p className="text-sm text-gray-500 animate-pulse">
                Carregando médicos...
              </p>
            )}

            {/* Lista */}
            {!loadingDoctors &&
              doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-800"
                >
                  Dr(a) {doc.name}
                </div>
              ))}

            {/* Nenhum médico */}
            {!loadingDoctors && doctors.length === 0 && (
              <p className="text-sm text-gray-500">Nenhum médico cadastrado.</p>
            )}
          </div>

          {/* Nova Consulta */}
          <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Nova Consulta
            </h2>

            <MiniCalendar
              selectedDate={date}
              markedDates={markedDates}
              onSelect={setDate}
            />

            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
              placeholder="Título da consulta"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
              placeholder="Nome do cliente"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />

            <input
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
              placeholder="CPF"
              value={form.cpf}
              onChange={(e) =>
                setForm({ ...form, cpf: formatCPF(e.target.value) })
              }
            />

            <select
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
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
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-400"
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
              className="w-full py-3 bg-purple-800 rounded-lg text-white font-semibold hover:bg-purple-700 transition"
            >
              Adicionar Consulta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
