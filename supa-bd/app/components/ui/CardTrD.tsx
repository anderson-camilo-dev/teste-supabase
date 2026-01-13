"use client";

import Link from "next/link";
import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "./3d-card";

export default function CardVisual() {
  return (
    <div className="bg-purple-50">
      <section
        className="
          max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-24 sm:py-32 lg:py-44
          grid lg:grid-cols-2
          gap-12 lg:gap-16
          items-center
        "
      >
        {/* CARD DE TEXTO */}
        <CardContainer className="inter-var w-full">
         <CardBody
  className="
    w-full max-w-xl
    bg-purple-50/50
    p-6 sm:p-8
    rounded-2xl
    shadow-lg shadow-purple-600/20
    border border-purple-600/10

    overflow-hidden
    min-h-[420px]
    flex flex-col justify-between
  "
>

            <CardItem
              translateZ={40}
              className="
                text-3xl sm:text-4xl lg:text-5xl
                font-bold text-purple-800
                leading-tight mb-6
              "
            >
              Gestão inteligente
              <br />
              para consultórios modernos
            </CardItem>

            <CardItem
              as="p"
              translateZ={30}
              className="
                text-gray-700 font-bold
                text-base sm:text-lg
                mb-8
              "
            >
              O{" "}
              <span className="text-purple-700 font-semibold">TechFlow</span> é
              um sistema completo para organização de consultas, médicos e
              pacientes, trazendo mais controle, agilidade e profissionalismo
              para o seu consultório.
            </CardItem>

            <div className="flex flex-col sm:flex-row gap-4">
              <CardItem translateZ={20}>
                <Link
                  href="/singUp"
                  className="
                    block px-8 py-4 rounded-xl
                    bg-purple-600 font-semibold
                    hover:bg-purple-700 transition
                    shadow-lg shadow-purple-600/30
                    text-center text-white
                  "
                >
                  cadastrar-se agora
                </Link>
              </CardItem>

              <CardItem translateZ={20}>
                <Link
                  href="/login"
                  className="
                    block px-8 py-4 rounded-xl
                    border border-purple-600/40
                    text-purple-600
                    hover:bg-purple-600/10 transition
                    text-center
                  "
                >
                  entrar agora
                </Link>
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>

        {/* IMAGEM / CALENDÁRIO */}
        <CardContainer className="inter-var w-full">
          <CardBody
            className="
              w-full
              flex justify-center items-center
            "
          >
            <CardItem translateZ={80}>
              <Image
                src="/pagina-principal/calendario.png"
                alt="Calendário 3D representando agendamentos"
                width={420}
                height={420}
                className="
                  object-contain
                  w-64 sm:w-80 lg:w-[420px]
                "
                priority
              />
            </CardItem>
          </CardBody>
        </CardContainer>
      </section>
    </div>
  );
}
