import Link from "next/link";
import Image from "next/image";
import Header from "./components/Header";
import CardVisual from "./components/ui/CardTrD";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-white">
      <Header />

      {/* ================= HERO ================= */}
     <div>
<CardVisual />

     </div>

      {/* ================= COMO FUNCIONA ================= */}
      <section
        id="como-funciona"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-20"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-purple-800">
          Como a <span className="font-extrabold">CONSULTAS.IO</span> ajuda seu
          consultório
        </h2>

        {/* Secretária */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex justify-center">
            <Image
              src="/pagina-principal/secretaria.png"
              alt="Secretária organizando consultas"
              width={420}
              height={420}
              className="object-contain w-64 sm:w-80 lg:w-full"
            />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-purple-700 mb-4">
              Organização para a secretária
            </h3>
            <p className="text-gray-600 font-semibold text-base sm:text-lg lg:text-xl leading-relaxed">
              A secretária consegue visualizar toda a agenda da semana em um só
              lugar, criar novos agendamentos rapidamente e evitar conflitos de
              horários. Tudo de forma simples, clara e profissional.
            </p>
          </div>
        </div>

        {/* Médica */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-purple-800 mb-4">
              Mais foco para os médicos
            </h3>
            <p className="text-gray-600 font-semibold text-base sm:text-lg lg:text-xl leading-relaxed">
              O médico tem acesso rápido à sua agenda, sabendo exatamente quais
              consultas acontecerão no dia e na semana, reduzindo atrasos e
              melhorando o atendimento ao paciente.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/pagina-principal/medica.png"
              alt="Profissional de saúde com estetoscópio"
              width={420}
              height={420}
              className="object-contain w-64 sm:w-80 lg:w-full"
            />
          </div>
        </div>
      </section>

      {/* ================= BENEFÍCIOS ================= */}
      <section className="bg-purple-800 border-t border-purple-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-purple-100 mb-12">
            Benefícios do sistema
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
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
                className="p-8 sm:p-10 lg:p-12 rounded-2xl bg-black/60 border border-purple-600/30"
              >
                <h4 className="text-2xl sm:text-3xl font-semibold text-purple-300 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-200">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="py-20 sm:py-24 text-center px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-800 mb-6">
          Leve seu consultório para o próximo nível
        </h2>
        <p className="text-gray-600 font-bold text-base sm:text-lg mb-10">
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
