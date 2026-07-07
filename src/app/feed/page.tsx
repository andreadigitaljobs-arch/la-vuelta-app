"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  PlusCircle,
  Trophy,
  Zap,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { formatDistance, formatDuration, formatPace, formatDate } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  distance: number;
  duration: number;
  avg_pace: number;
  calories: number;
  notes: string;
  created_at: string;
  route_coordinates: unknown;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, profiles(full_name, username, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setActivities(data as Activity[]);
      }
      setLoading(false);
    };

    fetchActivities();
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

  return (
    <div className="app-shell">
      <Navigation />

      <main className="px-4 pb-24 pt-20">
        <div className="mx-auto max-w-5xl">
          <section className="mb-5 overflow-hidden border border-wool/10 bg-wine/88 py-3">
            <div className="ticker-animate flex whitespace-nowrap">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex">
                  {[
                    "NADIE CORRE CON EGO",
                    "TODOS LOS RITMOS SE RESPETAN",
                    "EL NUEVO SE INTEGRA",
                    "LA COMUNIDAD VA PRIMERO",
                  ].map((item) => (
                    <span key={item} className="display-title px-5 text-lg text-wool/80">
                      {item} {"//"}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="brand-panel p-5 sm:p-6">
              <p className="section-kicker mb-3">Feed social</p>
              <h1 className="display-title text-5xl text-cream sm:text-7xl">
                Actividad reciente.
              </h1>
              <p className="mt-4 max-w-2xl font-secondary text-sm leading-6 text-wool/68 sm:text-base">
                Cada carrera suma historia: mapa, ritmo, distancia y el empuje de
                los que salen contigo.
              </p>
            </div>
            <Link
              href="/tracker"
              className="cream-panel flex min-h-40 flex-col justify-between p-5 transition hover:-translate-y-0.5"
            >
              <PlusCircle size={28} className="text-wine" />
              <div>
                <p className="display-title text-4xl">Grabar vuelta</p>
                <p className="mt-2 font-secondary text-sm font-semibold text-fire/70">
                  Inicia el GPS y comparte tu próxima salida.
                </p>
              </div>
            </Link>
          </section>

          {activities.length === 0 ? (
            <div className="brand-panel px-5 py-16 text-center">
              <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full border border-caramel/30 bg-dark/45">
                <Trophy size={28} className="text-caramel" />
              </div>
              <p className="display-title text-4xl text-cream">
                Aún no hay actividad
              </p>
              <p className="mx-auto mt-2 max-w-sm font-secondary text-sm text-wool/58">
                Sé el primero en compartir tu run y encender el feed del club.
              </p>
              <Link href="/tracker" className="brand-button mt-7">
                Grabar actividad
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {activities.map((activity) => (
                <article key={activity.id} className="activity-card brand-panel overflow-hidden">
                  <div className="flex items-start gap-3 border-b border-wool/10 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-caramel/30 bg-chestnut">
                      <span className="font-display text-base text-cream">
                        {activity.profiles?.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-secondary text-sm font-bold text-cream">
                        {activity.profiles?.full_name || "Runner"}
                      </p>
                      <p className="font-secondary text-xs text-wool/42">
                        @{activity.profiles?.username || "runner"} ·{" "}
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <span className="ml-auto border border-caramel/25 bg-wine/35 px-3 py-1 font-secondary text-[10px] font-bold uppercase tracking-[0.16em] text-caramel">
                      {activity.type}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="metric-card p-3">
                        <MapPin size={15} className="mb-2 text-caramel" />
                        <p className="display-title text-2xl text-cream">
                          {formatDistance(activity.distance)}
                        </p>
                        <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                          Distancia
                        </p>
                      </div>
                      <div className="metric-card p-3">
                        <Clock size={15} className="mb-2 text-caramel" />
                        <p className="display-title text-2xl text-cream">
                          {formatDuration(activity.duration)}
                        </p>
                        <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                          Tiempo
                        </p>
                      </div>
                      <div className="metric-card p-3">
                        <Zap size={15} className="mb-2 text-caramel" />
                        <p className="display-title text-2xl text-caramel">
                          {formatPace(activity.avg_pace)}
                        </p>
                        <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                          Ritmo/km
                        </p>
                      </div>
                    </div>

                    {activity.notes && (
                      <p className="mt-4 border-l-2 border-caramel/55 pl-3 font-secondary text-sm leading-6 text-wool/72">
                        {activity.notes}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-5 border-t border-wool/10 pt-3">
                      <button className="flex items-center gap-1.5 font-secondary text-xs font-semibold text-wool/44 transition-colors hover:text-caramel">
                        <Heart size={16} />
                        Me gusta
                      </button>
                      <button className="flex items-center gap-1.5 font-secondary text-xs font-semibold text-wool/44 transition-colors hover:text-caramel">
                        <MessageCircle size={16} />
                        Comentar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
