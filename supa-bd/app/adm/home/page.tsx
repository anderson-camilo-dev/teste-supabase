"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChartAreaInteractive } from "@/app/components/ui/shadcn-io/area-chart-01";
import { Modal } from "@/app/components/Modal";
import Link from "next/link";

/* =====================
   TIPAGENS
===================== */
interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  title: string;
  patient_name: string;
  cpf: string;
  phone: string;
  state: string;
  city: string;
  neighborhood: string;
  house_number: string;
  doctor_id: string;
  doctor_name: string;
  hour: string;
  date: string;
}

/* =====================
   UTILIDADES
===================== */
const hours = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

function getWeek(dateStr: string) {
  const base = new Date(dateStr);
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatCPF(value: string) {
  value = value.replace(/\D/g, "").substring(0, 11);
  return value
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
}

function isValidCPF(cpf: string) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

/* =====================
   MINI CALENDÁRIO
===================== */
function MiniCalendar({ selectedDate, markedDates, onSelect }: any) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
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
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            {d && (
              <button
                onClick={() => onSelect(d.dateStr)}
                className={`w-9 h-9 rounded-full text-xs
                  ${
                    d.dateStr === selectedDate
                      ? "bg-purple-600 text-white"
                      : markedDates.includes(d.dateStr)
                      ? "bg-purple-900 text-white"
                      : "text-gray-400"
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
   CARD DE CONSULTA
===================== */
function AppointmentCard({ a, refresh }: any) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function remove() {
    await supabase.from("scheduling").delete().eq("id", a.id);
    refresh();
    setConfirm(false);
  }

  return (
    <div className="relative p-2 bg-black/60 border border-purple-600/30 rounded-lg">
      <p onClick={() => setOpen(true)} className="cursor-pointer text-xs text-white">
        {a.hour}
      </p>

      <button
        onClick={() => setConfirm(true)}
        className="absolute top-1 right-1 text-red-500 text-xs"
      >
        ×
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Detalhes">
        <div className="space-y-1 text-sm">
          <p><b>Paciente:</b> {a.patient_name}</p>
          <p><b>CPF:</b> {a.cpf}</p>
          <p><b>Telefone:</b> {a.phone}</p>
          <p><b>Estado:</b> {a.state}</p>
          <p><b>Cidade:</b> {a.city}</p>
          <p><b>Bairro:</b> {a.neighborhood}</p>
          <p><b>Nº:</b> {a.house_number}</p>
          <p><b>Médico:</b> {a.doctor_name}</p>
        </div>
      </Modal>

      <Modal isOpen={confirm} onClose={() => setConfirm(false)} title="Confirmar">
        <p>Cancelar consulta?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setConfirm(false)}>Não</button>
          <button onClick={remove} className="text-red-500">Sim</button>
        </div>
      </Modal>
    </div>
  );
}

/* =====================
   HOME ADMIN
===================== */
export default function HomePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [form, setForm] = useState({
    title: "",
    client: "",
    cpf: "",
    phone: "",
    state: "",
    city: "",
    neighborhood: "",
    houseNumber: "",
    doctorId: "",
    hour: "",
  });

  async function fetchDoctors() {
    const { data } = await supabase
      .from("users")
      .select("id, name")
      .eq("role", "medico");
    setDoctors(data || []);
  }

  async function fetchAppointments() {
    const week = getWeek(date);
    const { data } = await supabase
      .from("scheduling")
      .select("*")
      .in("date", week)
      .order("date")
      .order("hour");

    setAppointments(data || []);
  }

  async function addAppointment() {
    if (Object.values(form).some((v) => !v)) {
      alert("Preencha todos os campos");
      return;
    }

    if (!isValidCPF(form.cpf)) {
      alert("CPF inválido");
      return;
    }

    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!doctor) return;

    await supabase.from("scheduling").insert({
      title: form.title,
      patient_name: form.client,
      cpf: form.cpf,
      phone: form.phone,
      state: form.state,
      city: form.city,
      neighborhood: form.neighborhood,
      house_number: form.houseNumber,
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      date,
      hour: form.hour,
    });

    setForm({
      title: "",
      client: "",
      cpf: "",
      phone: "",
      state: "",
      city: "",
      neighborhood: "",
      houseNumber: "",
      doctorId: "",
      hour: "",
    });

    fetchAppointments();
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const markedDates = Array.from(new Set(appointments.map((a) => a.date)));

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="grid grid-cols-2">
        <div>
        <h1 className="text-3xl text-purple-400 font-bold">Home ADMIN</h1>
        </div>
        <div className="grid justify-end grid-cols-2 gap-4 pb-12">
        <Link className="bg-purple-800 shadow-2xl rounded-xl p-2 shadow-purple-500 " href="/login">Sair</Link>
        <Link className="bg-purple-800 shadow-2xl rounded-xl p-2 shadow-purple-500" href="/users">Usuários</Link>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-3 space-y-2">
          <MiniCalendar
            selectedDate={date}
            markedDates={markedDates}
            onSelect={setDate}
          />

          {Object.entries(form).map(
            ([key, value]) =>
              key !== "doctorId" &&
              key !== "hour" && (
                <input
                  key={key}
                  value={value}
                  placeholder={key}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]:
                        key === "cpf"
                          ? formatCPF(e.target.value)
                          : e.target.value,
                    })
                  }
                  className="w-full p-2 bg-black border border-purple-600/40 rounded"
                />
              )
          )}

          <select
            className="w-full p-2 bg-black border rounded"
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          >
            <option value="">Médico</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            className="w-full p-2 bg-black border rounded"
            onChange={(e) => setForm({ ...form, hour: e.target.value })}
          >
            <option value="">Horário</option>
            {hours.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          <button
            onClick={addAppointment}
            className="w-full bg-purple-600 p-2 rounded"
          >
            Adicionar
          </button>
        </div>

        <div className="col-span-3 h-[800px] overflow-y-auto">
          <div className="grid grid-cols-7 gap-2">
            {getWeek(date).map((day) => (
              <div key={day} className="space-y-1">
                <p className="text-xs text-purple-400 text-center">{day}</p>
                {appointments
                  .filter((a) => a.date === day)
                  .map((a) => (
                    <AppointmentCard
                      key={a.id}
                      a={a}
                      refresh={fetchAppointments}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <ChartAreaInteractive />
      </div>
    </main>
  );
}
