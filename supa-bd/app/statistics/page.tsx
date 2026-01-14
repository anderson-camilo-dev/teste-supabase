"use client";

import { useEffect, useMemo, useState } from "react";
import HeaderNav from "../components/HeaderAtend";
import { supabase } from "@/lib/supabase";

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

import * as XLSX from "xlsx";

interface Scheduling {
  id: string;
  cpf: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  hour: string;
}

async function fetchScheduling(): Promise<Scheduling[]> {
  const { data, error } = await supabase.from("scheduling").select("*");
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

function groupByDoctor(data: Scheduling[]) {
  const map: Record<string, number> = {};
  data.forEach((a) => {
    map[a.doctor_name] = (map[a.doctor_name] || 0) + 1;
  });

  return Object.entries(map).map(([doctor, total]) => ({
    Médico: doctor,
    Consultas: total,
  }));
}

function groupByPatient(data: Scheduling[]) {
  const map: Record<string, number> = {};
  data.forEach((a) => {
    map[a.cpf] = (map[a.cpf] || 0) + 1;
  });

  return Object.entries(map)
    .map(([cpf, total]) => ({
      CPF: cpf,
      Atendimentos: total,
    }))
    .sort((a, b) => b.Atendimentos - a.Atendimentos);
}

async function exportReport() {
  const data = await fetchScheduling();
  if (!data.length) return;

  const wb = XLSX.utils.book_new();
  const wsDoctors = XLSX.utils.json_to_sheet(groupByDoctor(data));
  const wsPatients = XLSX.utils.json_to_sheet(groupByPatient(data));

  XLSX.utils.book_append_sheet(wb, wsDoctors, "Consultas por Médico");
  XLSX.utils.book_append_sheet(wb, wsPatients, "Pacientes");

  XLSX.writeFile(wb, "relatorio-consultorio.xlsx");
}

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

export default function DashboardPage() {
  const [data, setData] = useState<Scheduling[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const data = await fetchScheduling();
      setData(data);
    }
    fetchAll();
  }, []);

  const weekData = useMemo(() => {
    const days = lastDays(7);
    return days.map((day) => ({
      day,
      consultas: data.filter((a) => a.date === day).length,
    }));
  }, [data]);

  const monthData = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const count = data.filter((a) => {
        const [y, m] = a.date.split("-").map(Number);
        return y === year && m === month;
      }).length;

      return {
        month: `${String(month).padStart(2, "0")}/${year}`,
        consultas: count,
      };
    });
  }, [data]);

  const byDoctor = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((a) => {
      map.set(a.doctor_name, (map.get(a.doctor_name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [data]);

  const byPatient = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    data.forEach((a) => {
      if (!map.has(a.cpf)) {
        map.set(a.cpf, { name: a.patient_name, total: 1 });
      } else {
        map.get(a.cpf)!.total++;
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data]);

  return (
    <main className="min-h-screen bg-slate-100">
      <HeaderNav />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
            Dashboard de Agendamentos
          </h1>

          <button
            onClick={exportReport}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Gerar relatório (Excel)
          </button>
        </div>

        {/* Semana */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="font-semibold text-slate-700 mb-3">
            Consultas na semana
          </h2>

          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="consultas"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Mês */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow overflow-x-auto">
          <h2 className="font-semibold text-slate-700 mb-3">
            Consultas por mês
          </h2>

          <div className="min-w-[300px] sm:min-w-[600px] h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultas" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Médico */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="font-semibold text-slate-700 mb-3">
            Consultas por médico
          </h2>

          <ul className="space-y-2">
            {byDoctor.map((d) => (
              <li
                key={d.name}
                className="flex justify-between text-sm sm:text-base bg-slate-50 border rounded-lg px-3 py-2 truncate"
              >
                <span className="truncate">{d.name}</span>
                <strong>{d.total}</strong>
              </li>
            ))}
          </ul>
        </section>

        {/* Pacientes */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="font-semibold text-slate-700 mb-3">
            Pacientes mais atendidos
          </h2>

          <ul className="space-y-2">
            {byPatient.map((p, i) => (
              <li
                key={i}
                className="flex justify-between text-sm sm:text-base bg-slate-50 border rounded-lg px-3 py-2 truncate"
              >
                <span className="truncate">{p.name}</span>
                <strong>{p.total}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
