"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";


interface User {
id: string;
name: string;
email: string;
role: string;
}


export default function UsersPage() {
const [users, setUsers] = useState<User[]>([]);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [name, setName] = useState("");


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


async function promoteUser(id: string) {
await supabase
.from("users")
.update({ role: "admin" })
.eq("id", id);


fetchUsers();
}


async function deleteUser(id: string) {
await supabase.from("users").delete().eq("id", id);
fetchUsers();
}


async function saveEdit() {
if (!editingUser) return;


await supabase
.from("users")
.update({ name })
.eq("id", editingUser.id);


setEditingUser(null);
setName("");
fetchUsers();
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
<h2 className="text-lg font-semibold text-white">
{user.name}
</h2>
<p className="text-sm text-gray-400 mb-2">{user.email}</p>
<span className="text-xs text-purple-400">Role: {user.role}</span>


<div className="flex gap-2 mt-4">
{user.role !== "admin" && (
<div></div>
)}






</div>
</div>
))}
</div>


</main>
);
}