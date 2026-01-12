import Link from "next/link";
import Image from "next/image";
import MenuHamburguer from "./menu/menu";
import MenuHamburguerNav from "./menuNva/menuNav";

export default function HeaderNav() {
  return (
    <header className="bg-purple-600 shadow">
      <div className=" mx-auto px-4 py-6 sm:px-6 grid grid-cols-3 lg:px-8">
        <div><Link href="/"><h1 className="text-3xl font-extrabold text-white">CONSUTAS.IO</h1></Link></div>
         
        <div className="grid grid-cols-3 text-center gap-8">
            <div><Link className=" font-semibold text-xl text-white" href="/client/home">Casa</Link></div>
            <div><Link className=" font-semibold text-xl text-white" href="/weeklyAgenda">Agenda Semanal</Link></div>
            <div><Link className=" font-semibold text-xl text-white" href="/statistics">Estatísticas</Link></div>


        </div>
        <div className=" grid grid-cols-3">
          <div></div>
          <div className="justify-items-end">

         <MenuHamburguerNav />
          </div>
         
          <div></div>
        </div>
      </div>
    </header>
  );
}
