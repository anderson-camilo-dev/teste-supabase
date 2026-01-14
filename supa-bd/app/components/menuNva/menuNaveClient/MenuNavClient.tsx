"use client";

import { useState } from "react";
import Link from "next/link";
import { IconNavClint } from "../../visual/NavIconClient";

export default function MenuHamburguerClient() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative  justify-items-end">
      {/* Ícone */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => setOpen(!open)}
        className="h-10 w-10 hover:text-black/30 cursor-pointer text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>

      {/* Caixa do menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-44  ">
          <ul className="flex flex-col text-sm text-gray-700">
            <li></li>
            <IconNavClint />
          </ul>
        </div>
      )}
    </div>
  );
}
