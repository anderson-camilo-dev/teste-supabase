"use client";

import { useState } from "react";
import Link from "next/link";

export default function MenuHamburguer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative justify-items-end">
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
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border">
          <ul className="flex flex-col text-sm text-gray-700">
            <li>
              <Link
                href="/login"
                className="block px-4 py-3 text-purple-500 font-semibold hover:text-purple-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                login
              </Link>
            </li>
            <li>
              <Link
                href="/singUp"
                className="block px-4 py-3 text-purple-500 font-semibold hover:text-purple-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                registrar-se
              </Link>
            </li>
           
          </ul>
        </div>
      )}
    </div>
  );
}
