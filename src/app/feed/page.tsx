"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance, formatDuration, formatPace, formatDate } from "@/lib/utils";
import { MapPin, Clock, Zap, Heart, MessageCircle, Trophy } from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen bg-fire flex items-center justify-center">
        <div className="text-wool font-display text-xl animate-pulse">
          CARGANDO...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fire">
      <Navigation />

      <main className="pt-14 pb-20">
        {/* Header ticker */}
        <div className="bg-wine border-b border-wool/20 py-2 overflow-hidden">
          <div className="flex whitespace-nowrap ticker-animate">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                <span className="font-display text-xs text-wool/70 px-4">
                  NADIE CORRE CON EGO //
                </span>
                <span className="font-display text-xs text-wool/70 px-4">
                  TODOS LOS RITMOS SE RESPETAN //
                </span>
                <span className="font-display text-xs text-wool/70 px-4">
                  EL NUEVO SE INTEGRA //
                </span>
                <span className="font-display text-xs text-wool/70 px-4">
                  LA COMUNIDAD VA PRIMERO //
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div className="max-w-lg mx-auto px-4 py-6">
          <h2 className="font-display text-2xl text-wool tracking-wider mb-6">
            ACTIVIDAD RECIENTE
          </h2>

          {activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-dark/50 rounded-full flex items-center justify-center mb-4">
                <Trophy size={28} className="text-caramel" />
              </div>
              <p className="font-secondary text-wool/60 text-sm mb-2">
                Aún no hay actividad
              </p>
              <p className="font-secondary text-wool/40 text-xs mb-6">
                Sé el primero en compartir tu run
              </p>
              <Link
                href="/tracker"
                className="inline-block bg-wine hover:bg-wine-light text-wool font-secondary font-bold uppercase tracking-widest py-3 px-8 text-sm transition-all"
              >
                GRABAR ACTIVIDAD
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="activity-card bg-dark/40 border border-chestnut/50 p-4"
                >
                  {/* User header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-chestnut rounded-full flex items-center justify-center">
                      <span className="font-display text-sm text-wool">
                        {activity.profiles?.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-secondary font-semibold text-wool text-sm">
                        {activity.profiles?.full_name || "Runner"}
                      </p>
                      <p className="font-secondary text-wool/40 text-xs">
                        @{activity.profiles?.username || "runner"} ·{" "}
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <span className="ml-auto bg-wine/30 text-caramel font-display text-xs px-3 py-1 uppercase">
                      {activity.type}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="font-display text-xl text-wool">
                        {formatDistance(activity.distance)}
                      </p>
                      <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                        Distancia
                      </p>
                    </div>
                    <div className="text-center border-x border-chestnut/30">
                      <p className="font-display text-xl text-wool">
                        {formatDuration(activity.duration)}
                      </p>
                      <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                        Tiempo
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-xl text-caramel">
                        {formatPace(activity.avg_pace)}
                      </p>
                      <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                        Ritmo/km
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {activity.notes && (
                    <p className="font-secondary text-wool/70 text-sm mb-3 border-t border-chestnut/30 pt-3">
                      {activity.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 border-t border-chestnut/30 pt-3">
                    <button className="flex items-center gap-1.5 text-wool/40 hover:text-wine transition-colors">
                      <Heart size={16} />
                      <span className="font-secondary text-xs">Me gusta</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-wool/40 hover:text-caramel transition-colors">
                      <MessageCircle size={16} />
                      <span className="font-secondary text-xs">Comentar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
