"use client";

import { useEffect, useMemo, useState } from "react";
import HeaderNav from "../components/HeaderAnav";

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

/* =======================
   Tipagem
======================= */
interface Scheduling {
  id: string;
  cpf: string;
  patient_name: string;
  doctor_name: string;
  date: string; // yyyy-mm-dd
  hour: string;
}

/* =======================
   Supabase
======================= */
async function fetchScheduling(): Promise<Scheduling[]> {
  const { data, error } = await supabase
    .from("scheduling")
    .select("cpf, patient_name, doctor_name, date");

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

/* =======================
   Excel helpers
======================= */
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

import * as XLSX from "xlsx";

async function exportReport() {
  const data = await fetchScheduling();
  if (!data.length) return;

  const wb = XLSX.readFile("/modelo-relatorio.xlsx");

  // ===== MÉDICOS =====
  const byDoctor = groupByDoctor(data);
  const wsDoctor = wb.Sheets["Consultas por Médico"];
  XLSX.utils.sheet_add_json(wsDoctor, byDoctor, {
    origin: "A2",
    skipHeader: false,
  });

  // ===== PACIENTES =====
  const byPatient = groupByPatient(data);
  const wsPatient = wb.Sheets["Pacientes"];
  XLSX.utils.sheet_add_json(wsPatient, byPatient, {
    origin: "A2",
    skipHeader: false,
  });

  XLSX.writeFile(wb, "relatorio-consultorio.xlsx");
}

/* =======================
   Utils
======================= */
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function lastDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return formatDate(d);
  });
}

/* =======================
   Page
======================= */
export default function DashboardPage() {
  const [data, setData] = useState<Scheduling[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const { data, error } = await supabase
        .from("scheduling")
        .select("*");

      if (!error) setData(data || []);
    }

    fetchAll();
  }, []);

  /* ===== Semana ===== */
  const weekData = useMemo(() => {
    const days = lastDays(7);

    return days.map((day) => ({
      day,
      consultas: data.filter((a) => a.date === day).length,
    }));
  }, [data]);

  /* ===== Mês ===== */
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

  /* ===== Médico ===== */
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

  /* ===== Pacientes ===== */
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
    <main className="min-h-screen bg-slate-100 space-y-8">
        <HeaderNav />
        <div className="grid grid-cols-3">
        <div></div>
        <div></div>
        <div>
            <div className="grid grid-cols-3">
                <div></div>
                <div></div>
      <button
        onClick={exportReport}
        className="px-4 py-2 bg-purple-600  text-white rounded-xl"
      >
        Gerar relatório (Excel)
      </button>
      </div>
      </div>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800">
        Dashboard de Agendamentos
      </h1>

      {/* Semana */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-slate-700 mb-4">
          Consultas na semana
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weekData}>
            <XAxis dataKey="day" />
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
      </section>

      {/* Mês */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-slate-700 mb-4">
          Consultas por mês
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="consultas" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Médico */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-slate-700 mb-4">
          Consultas por médico
        </h2>

        <ul className="space-y-2">
          {byDoctor.map((d) => (
            <li
              key={d.name}
              className="flex justify-between bg-slate-50 border rounded-lg px-4 py-2"
            >
              <span>{d.name}</span>
              <strong>{d.total}</strong>
            </li>
          ))}
        </ul>
      </section>

      {/* Pacientes */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-slate-700 mb-4">
          Pacientes mais atendidos
        </h2>

        <ul className="space-y-2">
          {byPatient.map((p, i) => (
            <li
              key={i}
              className="flex justify-between bg-slate-50 border rounded-lg px-4 py-2"
            >
              <span>{p.name}</span>
              <strong>{p.total}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
