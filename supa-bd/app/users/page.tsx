"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "medico" | "secretaria";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  async function fetchUsers() {
    const { data } = await supabase
      .from("users")
      .select("id,name,email,role")
      .order("created_at", { ascending: false });

    setUsers(data || []);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser(id: string) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    await supabase.from("users").delete().eq("id", id);
    fetchUsers();
  }

  async function saveEdit() {
    if (!editingUser) return;

    await supabase
      .from("users")
      .update({
        name,
        role,
      })
      .eq("id", editingUser.id);

    setEditingUser(null);
    setName("");
    setRole("");
    fetchUsers();
  }

  function startEdit(user: User) {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
  }

  function roleLabel(role: string) {
    switch (role) {
      case "admin":
        return "Administrador";
      case "medico":
        return "Médico";
      case "secretaria":
        return "Secretária";
      default:
        return "Usuário";
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-10">
      <h1 className="text-3xl font-bold text-purple-400 mb-8">
        Usuários cadastrados
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl bg-black/70 border border-purple-700/40 p-6 shadow-xl"
          >
            {editingUser?.id === user.id ? (
              <>
                {/* EDIÇÃO */}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-lg bg-black/60 border border-purple-600/40 text-white"
                />

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mb-3 px-3 py-2 rounded-lg bg-black/60 border border-purple-600/40 text-white"
                >
                  <option value="user">Usuário</option>
                  <option value="medico">Médico</option>
                  <option value="secretaria">Secretária</option>
                  <option value="admin">Administrador</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 py-2 bg-purple-600 rounded-lg text-white"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2 border border-purple-600/40 rounded-lg text-purple-300"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* VISUAL */}
                <h2 className="text-lg font-semibold text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-400">{user.email}</p>

                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-300">
                  {roleLabel(user.role)}
                </span>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => startEdit(user)}
                    className="flex-1 py-2 border border-purple-600/40 rounded-lg text-purple-300 hover:bg-purple-600/10"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="flex-1 py-2 border border-red-600/40 rounded-lg text-red-400 hover:bg-red-600/10"
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
