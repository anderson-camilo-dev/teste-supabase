"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNav from "../components/HeaderAtend";

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

function getWeek(base: Date) {
  const sunday = new Date(base);
  const day = sunday.getDay();
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
    return data.filter((a) => a.date === day && a.hour.slice(0, 5) === hour);
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
    <main className="min-h-screen bg-white/95   text-purple-900">
      {/* Header */}
      <HeaderNav />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold py-6 text-3xl text-purple-800">
          Agenda Semanal
        </h1>
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={prevWeek}
              className="px-4 py-2 rounded-xl bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
            >
              ← Semana anterior
            </button>
            <button
              onClick={nextWeek}
              className="px-4 py-2 rounded-xl bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
            >
              Próxima semana →
            </button>
          </div>
        </div>

        {/* Cabeçalho */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          <div className="bg-purple-200 text-purple-800 font-semibold rounded-xl py-2 text-center">
            Hora
          </div>

          {week.map((day) => (
            <div
              key={day}
              className="bg-purple-200 text-purple-800 font-semibold rounded-xl py-2 text-center"
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
              <div className="flex items-center justify-center bg-purple-200 text-purple-800 font-semibold rounded-xl">
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
                    h-12 rounded-xl border text-sm font-medium transition
                    flex items-center justify-center px-1
                    ${
                      apps.length
                        ? "bg-purple-600 text-white border-purple-700"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-100"
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
            <div className="bg-white rounded-2xl p-6 w-96 space-y-3 shadow-lg shadow-purple-200/50">
              <h2 className="text-lg font-bold text-purple-800">Consultas</h2>

              {selected.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-purple-50 border border-purple-200"
                >
                  <p className="font-semibold text-purple-800">
                    {a.patient_name}
                  </p>
                  <p className="text-sm text-purple-600">
                    {a.title} • {a.hour.slice(0, 5)} • {a.doctor_name}
                  </p>
                </div>
              ))}

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
