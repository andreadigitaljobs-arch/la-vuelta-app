"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fire flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-wine rounded-full flex items-center justify-center border-2 border-caramel mb-4">
            <span className="font-display text-3xl text-wool">LV</span>
          </div>
          <h1 className="font-display text-3xl text-wool tracking-wider">
            LA VUELTA
          </h1>
          <p className="font-secondary text-xs text-wool/50 tracking-widest mt-1">
            RUNNING CO.
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-secondary font-semibold py-3.5 flex items-center justify-center gap-3 transition-all text-sm mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? "CONECTANDO..." : "CONTINUAR CON GOOGLE"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-chestnut/50" />
          <span className="font-secondary text-xs text-wool/30 uppercase">
            o
          </span>
          <div className="flex-1 h-px bg-chestnut/50" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-wine/20 border border-wine text-caramel text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-3 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-3 pr-12 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-wool/40 hover:text-wool"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine hover:bg-wine-light disabled:opacity-50 text-wool font-secondary font-bold uppercase tracking-widest py-3.5 transition-all text-sm"
          >
            {loading ? "ENTRANDO..." : "INICIAR SESIÓN"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/register"
            className="text-wool/50 hover:text-caramel font-secondary text-sm transition-colors"
          >
            ¿No tienes cuenta?{" "}
            <span className="font-semibold text-caramel">Regístrate</span>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-wool/30 hover:text-wool/60 font-secondary text-xs transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
