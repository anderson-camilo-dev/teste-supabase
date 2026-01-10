import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">

        {/* Texto */}
        <div>
          <h1 className="text-5xl font-bold text-purple-400 leading-tight mb-6">
            Gestão inteligente<br />para consultórios modernos
          </h1>

          <p className="text-gray-300 text-lg mb-8">
            O <span className="text-purple-400 font-semibold">TechFlow</span> é
            um sistema completo para organização de consultas, médicos e
            pacientes, trazendo mais controle, agilidade e profissionalismo
            para o seu consultório.
          </p>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-purple-600 font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30"
            >
              Acessar sistema
            </Link>

            <Link
              href="#como-funciona"
              className="px-8 py-4 rounded-xl border border-purple-600/40 text-purple-300 hover:bg-purple-600/10 transition"
            >
              Saiba mais
            </Link>
          </div>
        </div>

        {/* Calendário 3D */}
        <div className="flex justify-center">
          <Image
            src="/pagina-principal/calendario.png" // ⬅️ coloque o caminho aqui
            alt="Calendário 3D representando agendamentos"
            width={360}
            height={360}
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}
      <section
        id="como-funciona"
        className="max-w-7xl mx-auto px-8 py-24 space-y-24"
      >
        <h2 className="text-4xl font-bold text-center text-purple-400">
          Como o TechFlow ajuda seu consultório
        </h2>

        {/* Secretária */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div className="flex justify-center">
            <Image
              src="/pagina-principal/secretaria.png" // ⬅️ caminho da ilustração
              alt="Secretária organizando consultas"
              width={420}
              height={420}
              className="object-contain"
            />
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-purple-300 mb-4">
              Organização para a secretária
            </h3>
            <p className="text-gray-300 leading-relaxed">
              A secretária consegue visualizar toda a agenda da semana em um só
              lugar, criar novos agendamentos rapidamente e evitar conflitos de
              horários. Tudo de forma simples, clara e profissional.
            </p>
          </div>
        </div>

        {/* Médica */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <h3 className="text-2xl font-semibold text-purple-300 mb-4">
              Mais foco para os médicos
            </h3>
            <p className="text-gray-300 leading-relaxed">
              O médico tem acesso rápido à sua agenda, sabendo exatamente quais
              consultas acontecerão no dia e na semana, reduzindo atrasos e
              melhorando o atendimento ao paciente.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/pagina-principal/medica.png" // ⬅️ caminho da foto da médica
              alt="Profissional de saúde com estetoscópio"
              width={420}
              height={420}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* ================= BENEFÍCIOS ================= */}
      <section className="bg-black/70 border-t border-purple-700/30">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <h2 className="text-4xl font-bold text-center text-purple-400 mb-12">
            Benefícios do sistema
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Agenda inteligente",
                text: "Visualização semanal clara, sem bagunça e sem conflitos de horário.",
              },
              {
                title: "Mais produtividade",
                text: "Menos tempo organizando, mais tempo atendendo pacientes.",
              },
              {
                title: "Visual profissional",
                text: "Um sistema moderno que passa confiança para toda a equipe.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-black/60 border border-purple-600/30"
              >
                <h4 className="text-xl font-semibold text-purple-300 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-bold text-purple-400 mb-6">
          Leve seu consultório para o próximo nível
        </h2>
        <p className="text-gray-400 mb-10">
          Comece agora a usar o TechFlow e transforme a organização do seu
          consultório.
        </p>

        <Link
          href="/login"
          className="inline-block px-10 py-4 rounded-xl bg-purple-600 font-semibold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30"
        >
          Entrar no sistema
        </Link>
      </section>
    </main>
  );
}
