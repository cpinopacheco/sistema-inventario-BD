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

  // Modificar el botón de tema para mejorar el contraste
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <TooltipProvider>
      <header className="bg-[#013612] dark:bg-[#013d14] text-white p-4 shadow-md dark:header-shadow-dark relative">
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
                  className={`bg-[#EABD00] hover:bg-[#d9ae00] text-[#013612] dark:bg-[#EABD00] dark:hover:bg-[#d9ae00] dark:text-[#013612]`}
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
          <div className="container mx-auto flex justify-between items-center">
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
                className={`bg-[#EABD00] hover:bg-[#d9ae00] text-[#013612] dark:bg-[#EABD00] dark:hover:bg-[#d9ae00] dark:text-[#013612]`}
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
