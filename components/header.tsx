"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { TooltipSimple } from "@/components/ui/tooltip-simple";
import Image from "next/image";
import { useMobile } from "@/hooks/use-mobile";
import { TooltipProvider } from "@/components/ui/tooltip";

interface HeaderProps {
  title: string;
  subtitle: string;
  logoUrl: string;
}

export function Header({ title, subtitle, logoUrl }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isMobile = useMobile();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <TooltipProvider>
      <header className="bg-[#013612] dark:bg-[#011a09] text-white p-4 shadow-md relative">
        {isMobile ? (
          <>
            {/* Botón de tema posicionado arriba a la derecha en mobile */}
            <div className="absolute top-2 right-2">
              <TooltipSimple
                text={
                  theme === "dark"
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
                }
                className={theme === "light" ? "bg-white text-black" : ""}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`text-white hover:bg-[#01471a] dark:hover:bg-[#012b10] ${
                    theme === "dark" ? "bg-[#012b10]/60" : "bg-[#01471a]/60"
                  }`}
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
              </TooltipSimple>
            </div>

            {/* Logo y texto centrados en mobile */}
            <div className="flex flex-col items-center justify-center pt-4 pb-4">
              <Image
                src={logoUrl || "/cenpecar-logo.png"}
                alt="Logo del Sistema"
                width={70}
                height={70}
                className="rounded-md mb-2"
              />
              <div className="text-center">
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm opacity-80">{subtitle}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto flex justify-between items-center pb-4">
            <div className="flex items-center">
              <Image
                src={logoUrl || "/cenpecar-logo.png"}
                alt="Logo del Sistema"
                width={60}
                height={60}
                className="rounded-md mr-4"
              />
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm opacity-80">{subtitle}</p>
              </div>
            </div>

            <TooltipSimple
              text={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              className={theme === "light" ? "bg-white text-black" : ""}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`text-white hover:bg-[#01471a] dark:hover:bg-[#012b10] ${
                  theme === "dark" ? "bg-[#012b10]/60" : "bg-[#01471a]/60"
                }`}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </TooltipSimple>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
}
