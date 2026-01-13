import Link from "next/link";
import Image from "next/image";
import MenuHamburguer from "./menu/menu";
import MenuHamburguerNav from "./menuNva/menuNav";
import { IconNav } from "./visual/NavIcon";

export default function HeaderNav() {
  return (
    <header className="bg-purple-600 shadow">
      <div className=" mx-auto px-4 py-6 sm:px-6 grid grid-cols-3 lg:px-8">
        <div>
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-white">CONSUTAS.IO</h1>
          </Link>
        </div>

        <div></div>
        <div className=" grid grid-cols-3">
          <div></div>
          <div className="justify-items-center pt-6">
            <MenuHamburguerNav />
          </div>

          <div></div>
        </div>
      </div>
    </header>
  );
}
