"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, MotionValue } from "motion/react";
import { useRef, useState } from "react";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export const FloatingDockAdm = ({ items, className }: { items: DockItem[]; className?: string }) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "w-full grid gap-2 p-2 rounded-xl bg-gray-50 shadow-md dark:bg-neutral-900",
        // Responsivo: 2 colunas em mobile, 3 em tablet, 4 em desktop
        "grid-cols-4 sm:grid-cols-3 md:grid-cols-4",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, href }: { mouseX: MotionValue; title: string; icon: React.ReactNode; href: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Tamanho adaptável
  const widthTransform = useTransform(distance, [-150, 0, 150], [35, 50, 35]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [35, 50, 35]);
  const widthIcon = useTransform(distance, [-150, 0, 150], [18, 25, 18]);
  const heightIcon = useTransform(distance, [-150, 0, 150], [18, 25, 18]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const wIcon = useSpring(widthIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const hIcon = useSpring(heightIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 cursor-pointer"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -bottom-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={{ width: wIcon, height: hIcon }} className="flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
