"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeaderNavAdm from "@/app/components/HeaderAdm";

/* =======================
   Tipagem
======================= */
interface Scheduling {
  id: string;
  patient_name: string;
  title: string;
  doctor_name: string;
  date: string;
  hour: string;
}

/* =======================
   Utils
======================= */
const hours = Array.from({ length: 12 }, (_, i) =>
  `${String(i + 8).padStart(2, "0")}:00`
); // 08 → 19

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeek(base: Date) {
  const monday = new Date(base);
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);

  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatDate(d);
  });
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
     Buscar agenda
  ======================= */
  useEffect(() => {
    async function fetchScheduling() {
      const { data, error } = await supabase
        .from("scheduling")
        .select("*")
        .in("date", week);

      if (error) {
        console.error(error);
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
    <main className="min-h-screen bg-white  sm:px-6 lg:px-10 ">
      <HeaderNavAdm />
<div className="p-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row  items-start  sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
          Agenda Semanal
        </h1>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={prevWeek}
            className="px-3 sm:px-4 py-2 rounded-lg bg-white border border-slate-300 text-gray-700 hover:bg-purple-600 hover:text-white transition"
          >
            ← Semana anterior
          </button>
          <button
            onClick={nextWeek}
            className="px-3 sm:px-4 py-2 rounded-lg bg-white border border-slate-300 text-gray-700 hover:bg-purple-600 hover:text-white transition"
          >
            Próxima semana →
          </button>
        </div>
      </div>

      {/* Cabeçalho - tabela */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] grid grid-cols-7 gap-2 mb-3">
          <div className="bg-purple-600 text-white font-semibold rounded-lg py-2 text-center">
            Hora
          </div>

          {week.map((day) => (
            <div
              key={day}
              className="bg-purple-600 text-white font-semibold rounded-lg py-2 text-center"
            >
              {new Date(day).toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
              })}
            </div>
          ))}
        </div>

        {/* Grid de horas */}
        <div className="min-w-[600px] grid grid-cols-7 gap-2">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              {/* Hora */}
              <div className="flex items-center justify-center bg-purple-600 text-white font-semibold rounded-lg py-2">
                {hour}
              </div>

              {/* Dias */}
              {week.map((day) => {
                const apps = getAppointments(day, hour);

                return (
                  <button
                    key={day + hour}
                    onClick={() => apps.length && setSelected(apps)}
                    className={`h-12 rounded-lg border text-sm font-medium transition flex items-center justify-center
                      ${
                        apps.length
                          ? "bg-purple-600 text-white border-purple-700"
                          : "bg-white text-gray-700 border-slate-300 hover:bg-purple-50"
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
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Consultas
            </h2>

            {selected.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg bg-slate-50 border border-purple-600"
              >
                <p className="font-semibold text-gray-800">{a.patient_name}</p>
                <p className="text-sm text-gray-600">
                  {a.title} • {a.hour.slice(0, 5)} • {a.doctor_name}
                </p>
              </div>
            ))}

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
