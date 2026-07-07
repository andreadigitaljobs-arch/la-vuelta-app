"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import {
  Home,
  Activity,
  PlusCircle,
  User,
  LogOut,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/feed", icon: Home, label: "Inicio" },
  { href: "/activities", icon: Activity, label: "Actividades" },
  { href: "/tracker", icon: PlusCircle, label: "Grabar" },
  { href: "/leaderboard", icon: Flame, label: "Ranking" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const supabase = createClient();

  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-fire/95 backdrop-blur-sm border-b border-chestnut">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="font-display text-xl text-wool tracking-wider">
              LA VUELTA
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-wool/60 hover:text-wool transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-t border-chestnut">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isRecord = item.href === "/tracker";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                  isRecord
                    ? "text-wine"
                    : isActive
                      ? "text-caramel"
                      : "text-wool/50 hover:text-wool"
                )}
              >
                {isRecord ? (
                  <div className="bg-wine rounded-full p-2 -mt-4 shadow-lg shadow-wine/30">
                    <item.icon size={24} className="text-wool" />
                  </div>
                ) : (
                  <item.icon size={22} />
                )}
                <span
                  className={cn(
                    "text-[10px] font-secondary font-semibold uppercase tracking-wider",
                    isRecord && "text-wine"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
