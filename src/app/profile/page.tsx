"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Calendar, Mail, MapPin, Settings, User } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { formatDistance } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
}

interface Stats {
  totalDistance: number;
  totalRuns: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalDistance: 0, totalRuns: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      const { data: activities } = await supabase
        .from("activities")
        .select("distance")
        .eq("user_id", user.id);

      if (activities) {
        setStats({
          totalDistance: activities.reduce((sum, activity) => sum + activity.distance, 0),
          totalRuns: activities.length,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fire">
        <div className="display-title text-2xl text-cream animate-pulse">
          CARGANDO...
        </div>
      </div>
    );
  }

  const initial = profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="app-shell">
      <Navigation />

      <main className="px-4 pb-24 pt-20">
        <div className="mx-auto max-w-4xl">
          <section className="brand-panel mb-5 overflow-hidden">
            <div className="h-28 border-b border-wool/10 bg-[linear-gradient(120deg,rgba(116,23,23,0.75),rgba(189,105,93,0.32)),url('/brand/hero-bg-v3.png')] bg-cover bg-center" />
            <div className="px-5 pb-6">
              <div className="-mt-12 mb-4 flex items-end justify-between gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-caramel bg-chestnut shadow-xl shadow-dark/30">
                  <span className="font-display text-4xl text-cream uppercase">
                    {initial}
                  </span>
                </div>
                <button
                  className="ghost-button px-3"
                  aria-label="Configuración de perfil"
                  type="button"
                >
                  <Settings size={17} />
                </button>
              </div>
              <p className="section-kicker">Perfil runner</p>
              <h1 className="display-title mt-2 text-5xl text-cream">
                {profile?.full_name || "Runner"}
              </h1>
              <p className="font-secondary text-sm font-bold text-caramel">
                @{profile?.username || "runner"}
              </p>
              {profile?.bio && (
                <p className="mt-4 max-w-2xl font-secondary text-sm leading-6 text-wool/68">
                  {profile.bio}
                </p>
              )}
            </div>
          </section>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <div className="cream-panel p-5 text-center">
              <p className="display-title text-5xl">{formatDistance(stats.totalDistance)}</p>
              <p className="mt-1 font-secondary text-xs font-bold uppercase tracking-[0.16em] text-fire/58">
                Distancia total
              </p>
            </div>
            <div className="metric-card p-5 text-center">
              <p className="display-title text-5xl text-caramel">{stats.totalRuns}</p>
              <p className="mt-1 font-secondary text-xs font-bold uppercase tracking-[0.16em] text-wool/42">
                Carreras
              </p>
            </div>
          </section>

          <section className="grid gap-3">
            <InfoRow icon={Mail} label="Email" value={user?.email || ""} />
            {profile?.location && (
              <InfoRow icon={MapPin} label="Ubicación" value={profile.location} />
            )}
            <InfoRow
              icon={Calendar}
              label="Miembro desde"
              value={
                profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })
                  : "2026"
              }
            />
            <InfoRow icon={User} label="Club" value="La Vuelta Running Co." />
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="brand-panel flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center border border-caramel/25 bg-wine/25">
        <Icon size={18} className="text-caramel" />
      </div>
      <div className="min-w-0">
        <p className="font-secondary text-[10px] font-bold uppercase tracking-[0.16em] text-wool/42">
          {label}
        </p>
        <p className="truncate font-secondary text-sm text-cream">{value}</p>
      </div>
    </div>
  );
}
