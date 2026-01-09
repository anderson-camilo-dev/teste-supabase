"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* =====================
   Tipagens
===================== */
interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: number;
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
const hours = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

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
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, dateStr };
  });

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="space-y-3">
      {/* Cabeçalho do mês */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="px-3 py-1 rounded-lg bg-purple-800/40 text-purple-300 hover:bg-purple-700/60"
        >
          ←
        </button>

        <span className="text-purple-300 font-semibold capitalize">
          {monthName}
        </span>

        <button
          onClick={nextMonth}
          className="px-3 py-1 rounded-lg bg-purple-800/40 text-purple-300 hover:bg-purple-700/60"
        >
          →
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Dias */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            {d && (
              <button
                onClick={() => onSelect(d.dateStr)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition
                  ${d.dateStr === selectedDate ? "bg-purple-600 text-white" : ""}
                  ${markedDates.includes(d.dateStr) && d.dateStr !== selectedDate ? "bg-purple-900 text-white" : ""}
                  ${!markedDates.includes(d.dateStr) && d.dateStr !== selectedDate ? "hover:bg-purple-800/40 text-gray-300" : ""}
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
   Página Agenda
===================== */
export default function AgendaPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [form, setForm] = useState({
    title: "",
    client: "",
    doctorId: "",
    hour: "",
  });

  /* =====================
     Buscar médicos do banco
  ===================== */
  async function fetchDoctors() {
    const { data } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "medico")
      .order("name");

    setDoctors(data || []);
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* =====================
     Criar consulta (local)
  ===================== */
  function addAppointment() {
    if (!form.title || !form.client || !form.doctorId || !form.hour) return;

    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!doctor) return;

    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: form.title,
        client: form.client,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hour: form.hour,
        date,
      },
    ]);

    setForm({ title: "", client: "", doctorId: "", hour: "" });
  }

  const markedDates = Array.from(new Set(appointments.map((a) => a.date)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">
        Agenda de Consultas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* =====================
           Médicos
        ===================== */}
        <div className="bg-black/70 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">
            Médicos
          </h2>

          <ul className="space-y-2">
            {doctors.map((doc) => (
              <li
                key={doc.id}
                className="p-3 rounded-xl bg-black/60 border border-purple-600/30 text-white"
              >
                {doc.name}
              </li>
            ))}

            {doctors.length === 0 && (
              <p className="text-sm text-gray-400">
                Nenhum médico cadastrado.
              </p>
            )}
          </ul>
        </div>

        {/* =====================
           Nova Consulta
        ===================== */}
        <div className="bg-black/70 border border-purple-700/40 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-purple-400">
            Nova Consulta
          </h2>

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

          <select
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          >
            <option value="">Selecione o médico</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
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
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          <button
            onClick={addAppointment}
            className="w-full py-3 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700"
          >
            Adicionar Consulta
          </button>
        </div>

        {/* =====================
           Agenda do Dia
        ===================== */}
        <div className="bg-black/70 border border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">
            Agenda do Dia
          </h2>

          <div className="space-y-3">
            {appointments
              .filter((a) => a.date === date)
              .sort((a, b) => a.hour.localeCompare(b.hour))
              .map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-black/60 border border-purple-600/30"
                >
                  <p className="font-medium text-white">
                    {a.hour} – {a.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    Cliente: {a.client}
                  </p>
                  <p className="text-sm text-gray-400">
                    Médico: {a.doctorName}
                  </p>
                </div>
              ))}

            {appointments.filter((a) => a.date === date).length === 0 && (
              <p className="text-sm text-gray-400">
                Nenhuma consulta para este dia.
              </p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
