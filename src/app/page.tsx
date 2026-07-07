"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/feed");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fire">
        <div className="text-wool font-display text-2xl animate-pulse">
          LA VUELTA
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fire flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-fire via-fire to-dark/80" />

        <div className="relative z-10 text-center max-w-lg mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-28 h-28 mx-auto bg-wine rounded-full flex items-center justify-center border-2 border-caramel shadow-lg shadow-wine/40">
              <span className="font-display text-4xl text-wool">LV</span>
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl text-wool leading-none tracking-wider mb-4">
            LA VUELTA
          </h1>
          <p className="font-display text-lg text-caramel tracking-widest mb-2">
            RUNNING CO.
          </p>
          <p className="font-secondary text-sm text-wool/60 tracking-wide mb-10">
            MARACAY, VENEZUELA
          </p>

          {/* Tagline */}
          <div className="mb-12">
            <p className="font-display text-2xl sm:text-3xl text-wool leading-tight">
              LA VUELTA SE DA
              <br />
              <span className="text-wine">JUNTOS.</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4">
            <Link
              href="/register"
              className="bg-wine hover:bg-wine-light text-wool font-secondary font-bold uppercase tracking-widest py-4 px-8 transition-all hover:shadow-lg hover:shadow-wine/30 text-sm"
            >
              CREAR CUENTA
            </Link>
            <Link
              href="/login"
              className="border border-wool/30 hover:border-wool text-wool/80 hover:text-wool font-secondary font-semibold uppercase tracking-wider py-4 px-8 transition-all text-sm"
            >
              YA TENGO CUENTA
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="bg-wine border-t border-b border-wool/20 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap ticker-animate">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex">
              <span className="font-display text-sm text-wool/80 px-6">
                NADIE CORRE CON EGO //
              </span>
              <span className="font-display text-sm text-wool/80 px-6">
                TODOS LOS RITMOS SE RESPETAN //
              </span>
              <span className="font-display text-sm text-wool/80 px-6">
                EL NUEVO SE INTEGRA //
              </span>
              <span className="font-display text-sm text-wool/80 px-6">
                LA COMUNIDAD VA PRIMERO //
              </span>
              <span className="font-display text-sm text-wool/80 px-6">
                TERMINAMOS CON BUENA VIBRA //
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
