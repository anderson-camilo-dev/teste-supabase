"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

/* =======================
   Tipagem
======================= */
interface Scheduling {
  id: string;
  patient_name: string;
  title: string;
  doctor_name: string;
  date: string; // yyyy-mm-dd
  hour: string; // HH:mm:ss
}

/* =======================
   Utils
======================= */

// 08:00 → 19:00
const hours = Array.from(
  { length: 12 },
  (_, i) => `${String(i + 8).padStart(2, "0")}:00`
);

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 🔥 DOMINGO → SÁBADO (7 DIAS, SEM PULAR)
function getWeek(base: Date) {
  const sunday = new Date(base);
  const day = sunday.getDay(); // 0 = domingo
  sunday.setDate(sunday.getDate() - day);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return formatDate(d);
  });
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* =======================
   Page
======================= */
export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<Scheduling[]>([]);
  const [selected, setSelected] = useState<Scheduling[] | null>(null);

  const week = useMemo(() => getWeek(currentDate), [currentDate]);

  /* =======================
     Buscar agendamentos
  ======================= */
  useEffect(() => {
    async function fetchScheduling() {
      const { data, error } = await supabase
        .from("scheduling")
        .select("*")
        .in("date", week);

      if (error) {
        console.error("Erro ao buscar agenda:", error);
        return;
      }

      setData(data || []);
    }

    fetchScheduling();
  }, [week]);

  function getAppointments(day: string, hour: string) {
    return data.filter(
      (a) => a.date === day && a.hour.slice(0, 5) === hour
    );
  }

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Agenda Semanal
        </h1>

        <div className="flex gap-2">
          <button
            onClick={prevWeek}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-200"
          >
            ← Semana anterior
          </button>
          <button
            onClick={nextWeek}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-200"
          >
            Próxima semana →
          </button>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="grid grid-cols-8 gap-2 mb-3">
        <div className="bg-slate-300 text-slate-800 font-semibold rounded-lg py-2 text-center">
          Hora
        </div>

        {week.map((day) => (
          <div
            key={day}
            className="bg-slate-300 text-slate-800 font-semibold rounded-lg py-2 text-center"
          >
            {parseLocalDate(day).toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
            })}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-2">
        {hours.map((hour) => (
          <div key={hour} className="contents">
            {/* Hora */}
            <div className="flex items-center justify-center bg-slate-300 text-slate-800 font-semibold rounded-lg">
              {hour}
            </div>

            {/* Dias */}
            {week.map((day) => {
              const apps = getAppointments(day, hour);

              return (
                <button
                  key={day + hour}
                  onClick={() => apps.length && setSelected(apps)}
                  className={`
                    h-12 rounded-lg border text-sm font-medium transition
                    flex items-center justify-center px-1
                    ${
                      apps.length
                        ? "bg-indigo-600 text-white border-indigo-700"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-indigo-50"
                    }
                  `}
                >
                  {apps.length === 1 && apps[0].patient_name}
                  {apps.length > 1 && `${apps.length} consultas`}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Consultas
            </h2>

            {selected.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <p className="font-semibold text-slate-800">
                  {a.patient_name}
                </p>
                <p className="text-sm text-slate-600">
                  {a.title} • {a.hour.slice(0, 5)} • {a.doctor_name}
                </p>
              </div>
            ))}

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
