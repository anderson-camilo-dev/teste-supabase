"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  ResponsiveContainer,
} from "recharts";


/* =====================
   Tipagem
===================== */
interface ChartData {
  day: string;
  total: number;
}

/* =====================
   Utils
===================== */
function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "short",
  });
}

/* =====================
   COMPONENTE
===================== */
export function ChartAreaInteractive() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyAppointments();
  }, []);

  async function loadWeeklyAppointments() {
    const week = getWeekDates();

    const { data: appointments, error } = await supabase
      .from("scheduling")
      .select("date")
      .in("date", week);

    if (error) {
      console.error(error);
      return;
    }

    const grouped = week.map((date) => ({
      day: formatDay(date),
      total: appointments?.filter((a) => a.date === date).length || 0,
    }));

    setData(grouped);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-6 bg-black/70 border  border-purple-700/40 text-purple-300">
        Carregando gráfico...
      </div>
    );
  }

  return (
    <div className="p-6 bg-black/70 border rounded-2xl border-purple-700/40">
      <h3 className="text-purple-400 font-semibold mb-4">
        Consultas da Semana
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="day"
            stroke="#c084fc"
            tickLine={false}
            axisLine={false}
          />

          <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" />

          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid #7e22ce",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#c084fc" }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="#a855f7"
            fillOpacity={1}
            fill="url(#colorConsultas)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
