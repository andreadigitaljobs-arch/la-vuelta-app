"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
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
            UNETE A LA COMUNIDAD
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-wine/20 border border-wine text-caramel text-sm p-3 rounded">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-3 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
          />

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
            required
            className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-3 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-3 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-wool/50 hover:text-caramel font-secondary text-sm transition-colors"
          >
            ¿Ya tienes cuenta?{" "}
            <span className="font-semibold text-caramel">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
