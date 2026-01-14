"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import HeaderNav from "../components/HeaderAtend";
/* =====================
   TIPOS
===================== */
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "medico" | "secretaria";
  cpf?: string;
  rua?: string;
  numero_casa?: string;
  bairro?: string;
  cidade?: string;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  hour: string;
  doctor_name: string;
}

/* =====================
   PAGE
===================== */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    rua: "",
    numero_casa: "",
    bairro: "",
    cidade: "",
  });

  /* =====================
     FETCH USERS
  ===================== */
  async function fetchUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data || []);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =====================
     FETCH APPOINTMENTS (MÊS ATUAL)
  ===================== */
  async function fetchAppointments(user: User) {
    const start = new Date();
    start.setDate(1);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const { data } = await supabase
      .from("scheduling")
      .select("id,title,date,hour,doctor_name")
      // 🔴 ajuste se usar patient_id
      .eq("patient_name", user.name)
      .gte("date", start.toISOString().split("T")[0])
      .lt("date", end.toISOString().split("T")[0])
      .order("date");

    setAppointments(data || []);
  }

  /* =====================
     OPEN PROFILE
  ===================== */
  function openProfile(user: User) {
    setSelectedUser(user);
    setEditing(false);
    setForm({
      name: user.name,
      role: user.role,
      rua: user.rua || "",
      numero_casa: user.numero_casa || "",
      bairro: user.bairro || "",
      cidade: user.cidade || "",
    });
    fetchAppointments(user);
  }

  /* =====================
     SAVE EDIT
  ===================== */
  async function saveEdit() {
    if (!selectedUser) return;

    await supabase
      .from("users")
      .update(form)
      .eq("id", selectedUser.id);

    setEditing(false);
    setSelectedUser(null);
    fetchUsers();
  }

  /* =====================
     DELETE USER
  ===================== */
  async function deleteUser() {
    if (!selectedUser) return;
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    await supabase.from("users").delete().eq("id", selectedUser.id);
    setSelectedUser(null);
    fetchUsers();
  }

  function roleLabel(role: string) {
    return {
      admin: "Administrador",
      medico: "Médico",
      secretaria: "Secretária",
      user: "Usuário",
    }[role];
  }

  return (
    <main className="min-h-screen bg-gradient-to-br text-white from-black via-purple-950 to-black ">
      <HeaderNav / >
      
      <div className="grid grid-cols-2 pt-10 max-w-7xl mx-auto px-4 mb-8">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">
        Usuários cadastrados
      </h1>
     
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl bg-black/70 border border-purple-700/40 p-6"
          >
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>

            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-300">
              {roleLabel(user.role)}
            </span>

            <button
              onClick={() => openProfile(user)}
              className="w-full mt-4 py-2 bg-purple-600 rounded-lg text-white"
            >
              Perfil
            </button>
          </div>
        ))}
      </div>

      {/* =====================
           MODAL PERFIL
      ===================== */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-black border border-purple-700/40 rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl text-purple-400 font-bold mb-4">
              Perfil do Usuário
            </h2>

            {!editing ? (
              <>
                <p><b>Nome:</b> {selectedUser.name}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>CPF:</b> {selectedUser.cpf || "-"}</p>
                <p><b>Rua:</b> {selectedUser.rua || "-"}</p>
                <p><b>Nº:</b> {selectedUser.numero_casa || "-"}</p>
                <p><b>Bairro:</b> {selectedUser.bairro || "-"}</p>
                <p><b>Cidade:</b> {selectedUser.cidade || "-"}</p>

                <h3 className="mt-6 mb-2 text-purple-300 font-semibold">
                  Agendamentos do mês
                </h3>

                {appointments.length === 0 && (
                  <p className="text-gray-500">Nenhum agendamento.</p>
                )}

                <ul className="space-y-2">
                  {appointments.map((a) => (
                    <li
                      key={a.id}
                      className="p-3 rounded-lg bg-black/60 border border-purple-600/30"
                    >
                      <p>{a.title}</p>
                      <p className="text-xs text-gray-400">
                        {a.date} • {a.hour} • Dr(a) {a.doctor_name}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 py-2 bg-purple-600 rounded-lg text-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={deleteUser}
                    className="flex-1 py-2 bg-red-600 rounded-lg text-white"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 py-2 border border-purple-600/40 rounded-lg text-purple-300"
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"
                />

                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"
                >
                  <option value="user">Usuário</option>
                  <option value="medico">Médico</option>
                  <option value="secretaria">Secretária</option>
                  <option value="admin">Administrador</option>
                </select>

                <input placeholder="Rua" value={form.rua} onChange={e=>setForm({...form,rua:e.target.value})} className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"/>
                <input placeholder="Número" value={form.numero_casa} onChange={e=>setForm({...form,numero_casa:e.target.value})} className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"/>
                <input placeholder="Bairro" value={form.bairro} onChange={e=>setForm({...form,bairro:e.target.value})} className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"/>
                <input placeholder="Cidade" value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} className="w-full mb-2 px-3 py-2 bg-black border border-purple-600/40 rounded"/>

                <div className="flex gap-2 mt-4">
                  <button onClick={saveEdit} className="flex-1 py-2 bg-purple-600 rounded-lg text-white">
                    Salvar
                  </button>
                  <button onClick={()=>setEditing(false)} className="flex-1 py-2 border border-purple-600/40 rounded-lg text-purple-300">
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
