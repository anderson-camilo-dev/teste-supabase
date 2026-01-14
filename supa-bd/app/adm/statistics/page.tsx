"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNav from "@/app/components/HeaderAtend";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

/* =====================
   TIPOS
===================== */
interface Scheduling {
  id: string;
  title: string;
  description: string;
  date: string;
  hour: string;
  cpf: string;
  patient_name: string;
  doctor_name: string;
  doctor_id: string;
  created_at: string;
}

/* =====================
   HELPERS
===================== */
function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function lastDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return formatDate(d);
  });
}

/* =====================
   PAGE
===================== */
export default function AdminConsultasPage() {
  const [consultas, setConsultas] = useState<Scheduling[]>([]);
  const [selected, setSelected] = useState<Scheduling | null>(null);

  /* =====================
     FETCH CONSULTAS
  ===================== */
  async function fetchConsultas() {
    const { data, error } = await supabase.from("scheduling").select("*");

    if (error) {
      console.error(error);
      return;
    }

    setConsultas(data || []);
  }

  useEffect(() => {
    fetchConsultas();
  }, []);

  /* =====================
     GRÁFICOS
  ===================== */
  const weekData = useMemo(() => {
    const days = lastDays(7);
    return days.map((day) => ({
      day,
      consultas: consultas.filter((c) => c.date === day).length,
    }));
  }, [consultas]);

  const monthData = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const total = consultas.filter((c) => {
        const [y, m] = c.date.split("-").map(Number);
        return y === year && m === month;
      }).length;

      return {
        month: `${String(month).padStart(2, "0")}/${year}`,
        consultas: total,
      };
    });
  }, [consultas]);

  const byDoctor = useMemo(() => {
    const map = new Map<string, number>();
    consultas.forEach((c) => {
      map.set(c.doctor_name, (map.get(c.doctor_name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [consultas]);

  /* =====================
     RENDER
  ===================== */
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-purple-400">
            Dashboard de Consultas
          </h1>
          <p className="text-gray-400">
            Visão geral de médicos e atendimentos
          </p>
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEMANA */}
          <div className="bg-black/70 border border-purple-700/40 p-6 rounded-2xl">
            <h2 className="font-semibold text-purple-300 mb-3">
              Consultas na semana
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="consultas"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MÊS */}
          <div className="bg-black/70 border border-purple-700/40 p-6 rounded-2xl">
            <h2 className="font-semibold text-purple-300 mb-3">
              Consultas por mês
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consultas" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MÉDICOS */}
        <section className="bg-black/70 border border-purple-700/40 p-6 rounded-2xl">
          <h2 className="font-semibold text-purple-300 mb-4">
            Consultas por Médico
          </h2>
          <ul className="space-y-2">
            {byDoctor.map((d) => (
              <li
                key={d.name}
                className="flex justify-between bg-black/60 border border-purple-600/30 rounded-lg px-4 py-2"
              >
                <span>{d.name}</span>
                <strong>{d.total}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* CONSULTAS */}
        <section>
          <h2 className="text-xl font-semibold text-purple-300 mb-4">
            Todas as Consultas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultas.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-black/70 border border-purple-700/40 p-6"
              >
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-400">
                  {c.date} • {c.hour}
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-purple-300">Paciente:</span>{" "}
                  {c.patient_name}
                </p>
                <p className="text-sm">
                  <span className="text-purple-300">Médico:</span>{" "}
                  {c.doctor_name}
                </p>

                <button
                  onClick={() => setSelected(c)}
                  className="w-full mt-4 py-2 bg-purple-600 rounded-lg"
                >
                  Detalhes
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MODAL DETALHES */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-black border border-purple-700/40 rounded-2xl p-6">
            <h2 className="text-2xl text-purple-400 font-bold mb-4">
              Detalhes da Consulta
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>Título:</b> {selected.title}
              </p>
              <p>
                <b>Descrição:</b> {selected.description}
              </p>
              <p>
                <b>Paciente:</b> {selected.patient_name}
              </p>
              <p>
                <b>CPF:</b> {selected.cpf}
              </p>
              <p>
                <b>Médico:</b> {selected.doctor_name}
              </p>
              <p>
                <b>Data:</b> {selected.date}
              </p>
              <p>
                <b>Hora:</b> {selected.hour}
              </p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-6 py-2 border border-purple-600/40 rounded-lg text-purple-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
