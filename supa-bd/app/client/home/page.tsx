"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChartAreaInteractive } from "@/app/components/ui/shadcn-io/area-chart-01";
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
const hours = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

function getWeek(dateStr: string) {
  const base = new Date(dateStr);
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1); // segunda
  const monday = new Date(base.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatCPF(value: string) {
  // Remove tudo que não for número
  value = value.replace(/\D/g, "");
  // Limita a 11 dígitos
  value = value.substring(0, 11);
  // Aplica a máscara
  if (value.length > 9) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
  }
  return value;
}

function isValidCPF(cpf: string) {
  // Remove máscara
  cpf = cpf.replace(/\D/g, "");
  // Deve ter 11 números
  return /^\d{11}$/.test(cpf);
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

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="px-3 py-1 rounded-lg bg-purple-800/40 text-purple-300"
        >
          ←
        </button>
        <span className="text-purple-300 font-semibold capitalize">
          {monthName}
        </span>
        <button
          onClick={nextMonth}
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
                    d.dateStr === selectedDate ? "bg-purple-600 text-white" : ""
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
   Componente AppointmentCard
===================== */
function AppointmentCard({ a, fetchAppointments, date }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function handleDelete() {
    await supabase.from("scheduling").delete().eq("id", a.id);
    fetchAppointments(date);
    setIsDeleteModalOpen(false);
  }

  return (
    <div className="relative p-2 rounded-lg bg-black/60 border border-purple-600/30">
      {/* Clique no agendamento abre modal de detalhes */}
      <div className="cursor-pointer mt-2" onClick={() => setIsModalOpen(true)}>
        <p className="text-white text-xs">{a.hour}</p>
      </div>

      {/* Modal de detalhes da consulta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes da Consulta"
      >
        <div className="space-y-2 text-sm text-white">
          <p>
            <strong>Título:</strong> {a.title}
          </p>
          <p>
            <strong>Cliente:</strong> {a.client}
          </p>
          <p>
            <strong>CPF:</strong> {a.cpf || "***.***.***-**"}
          </p>
          <p>
            <strong>Médico:</strong> {a.doctorName}
          </p>
          <p>
            <strong>Data:</strong> {a.date}
          </p>
          <p>
            <strong>Hora:</strong> {a.hour}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 text-white"
          >
            Fechar
          </button>
        </div>
      </Modal>

      {/* Modal de cancelamento */}
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className="absolute top-1 right-1 text-red-500 text-xs font-bold hover:text-red-700"
        title="Cancelar consulta"
      >
        ×
      </button>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar cancelamento"
      >
        <p>Tem certeza que deseja cancelar esta consulta?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white"
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
}



/* =====================
   Página Home
===================== */
export default function HomePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
  

  async function fetchAppointments(selectedDate: string) {
    const week = getWeek(selectedDate);
    const { data } = await supabase
      .from("scheduling")
      .select("*")
      .in("date", week)
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
async function addAppointment() {
  // Verifica campos vazios
  if (!form.title || !form.client || !form.cpf || !form.doctorId || !form.hour) {
    alert("Preencha todos os campos corretamente");
    return;
  }

  // Verifica CPF válido
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
      alert("⚠️ Este horário já está ocupado para este médico.");
    else {
      alert("Erro ao salvar consulta");
      console.error(error);
    }
    return;
  }

  setForm({ title: "", client: "", cpf: "", doctorId: "", hour: "" });
  fetchAppointments(date);
}


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
        alert("⚠️ Este horário já está ocupado para este médico.");
      else {
        alert("Erro ao salvar consulta");
        console.error(error);
      }
      return;
    }

    setForm({ title: "", client: "", cpf: "", doctorId: "", hour: "" });
    fetchAppointments(date);
  }

  useEffect(() => {
    fetchDoctors();
  }, []);
  useEffect(() => {
    fetchAppointments(date);
  }, [date]);

  const markedDates = Array.from(new Set(appointments.map((a) => a.date)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-10">
      <div className="grid grid-cols-2">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">
        Agenda de Consultas
      </h1>
      <Link
        href="/login"
        className="justify-self-end inline-block rounded-xl  px-3 h-6 text-white font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30"
      >
        Sair
      </Link>
</div>
      <div className="grid lg:grid-cols-6 gap-6">
        {/* Médicos */}
        <div className="bg-black/70 border col-span-1 border-purple-700/40 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">
            Médicos
          </h2>
          <ul className="space-y-2">
            {doctors.map((doc) => (
              <li
                key={doc.id}
                className="p-3 rounded-xl bg-black/60 border  border-purple-600/30 text-white"
              >
                dr(a) {doc.name}
              </li>
            ))}
            {doctors.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum médico cadastrado.</p>
            )}
          </ul>
        </div>

        {/* Nova Consulta */}
        <div className="bg-black/70 border border-purple-700/40 col-span-3 rounded-2xl p-6 space-y-4">
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
          <input
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-600/40 text-white"
            placeholder="CPF do cliente"
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
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <button
            onClick={addAppointment}
            className="w-full py-3 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700"
          >
            Adicionar Consulta
          </button>
        </div>

        {/* Agenda da semana */}
        <div className="col-span-2 h-[850px] flex flex-col">
          {" "}
          {/* altura fixa da coluna */}
          <div className="h-full bg-black/70 border  border-purple-700/40 rounded-2xl flex flex-col">
            {/* =====================
        Título fixo
    ===================== */}
            <div className="p-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-purple-400">
                Agenda da Semana
              </h2>
            </div>

            {/* =====================
        Calendário da semana + consultas
        Altura fixa, rolagem se necessário
    ===================== */}
            <div className="flex-1 px-6 pb-6 overflow-y-auto   scrollbar-thin scrollbar-thumb-purple-700  scrollbar-track-black">
              <div className="grid grid-cols-7 gap-3 text-xs ">
                {getWeek(date).map((day) => (
                  <div key={day} className="space-y-2">
                    <p className="text-purple-300 font-semibold border border-purple-500 bg-purple-600/30 text-center">
                      {new Date(day).toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                      })}
                    </p>

                    {appointments
                      .filter((a) => a.date === day)
                      .map((a) => (
                        <AppointmentCard
                          key={a.id}
                          a={a}
                          fetchAppointments={fetchAppointments}
                          date={date}
                        />
                      ))}

                    {appointments.filter((a) => a.date === day).length ===
                      0 && <p className="text-gray-500 text-center">—</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* =====================
        Gráfico fixo embaixo
    ===================== */}
          </div>
          <div className="pt-2  pb-6 flex-shrink-0">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </main>
  );
}
