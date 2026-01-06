import Link from "next/link";


export default function HomePage() {
return (
<main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-black">
<div className="text-center p-10 rounded-2xl bg-black/70 border border-purple-700/40 backdrop-blur-xl shadow-2xl">
<h1 className="text-4xl font-bold text-purple-400 mb-4">
TechFlow
</h1>
<p className="text-gray-400 mb-8">
Plataforma futurista e profissional
</p>


<Link
href="/login"
className="inline-block rounded-xl bg-purple-600 px-8 py-4 text-white font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30"
>
Acessar sistema
</Link>
</div>
</main>
);
}