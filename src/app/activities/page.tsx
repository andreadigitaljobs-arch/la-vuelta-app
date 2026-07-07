"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance, formatDuration, formatPace, formatDate } from "@/lib/utils";
import { MapPin, Clock, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  distance: number;
  duration: number;
  avg_pace: number;
  calories: number;
  notes: string;
  created_at: string;
}

export default function ActivitiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalRuns: 0,
    avgPace: 0,
    totalCalories: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setActivities(data as Activity[]);
        const totalDist = data.reduce((sum, a) => sum + a.distance, 0);
        const totalCals = data.reduce((sum, a) => sum + (a.calories || 0), 0);
        const avgP =
          data.length > 0
            ? data.reduce((sum, a) => sum + a.avg_pace, 0) / data.length
            : 0;
        setStats({
          totalDistance: totalDist,
          totalRuns: data.length,
          avgPace: avgP,
          totalCalories: totalCals,
        });
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
        {/* Stats summary */}
        <div className="bg-dark/50 border-b border-chestnut p-4">
          <div className="max-w-lg mx-auto">
            <h2 className="font-display text-lg text-wool tracking-wider mb-4">
              MI RESUMEN
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <TrendingUp size={16} className="mx-auto text-caramel mb-1" />
                <p className="font-display text-lg text-wool">
                  {formatDistance(stats.totalDistance)}
                </p>
                <p className="font-secondary text-[9px] text-wool/40 uppercase">
                  Total
                </p>
              </div>
              <div className="text-center">
                <MapPin size={16} className="mx-auto text-caramel mb-1" />
                <p className="font-display text-lg text-wool">{stats.totalRuns}</p>
                <p className="font-secondary text-[9px] text-wool/40 uppercase">
                  Carreras
                </p>
              </div>
              <div className="text-center">
                <Zap size={16} className="mx-auto text-caramel mb-1" />
                <p className="font-display text-lg text-caramel">
                  {stats.avgPace > 0 ? formatPace(1000 / stats.avgPace) : "0:00"}
                </p>
                <p className="font-secondary text-[9px] text-wool/40 uppercase">
                  Ritmo medio
                </p>
              </div>
              <div className="text-center">
                <Clock size={16} className="mx-auto text-caramel mb-1" />
                <p className="font-display text-lg text-wool">
                  {stats.totalCalories}
                </p>
                <p className="font-secondary text-[9px] text-wool/40 uppercase">
                  Calorías
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities list */}
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-wool tracking-wider">
              MIS ACTIVIDADES
            </h2>
            <Link
              href="/tracker"
              className="bg-wine hover:bg-wine-light text-wool p-2 transition-all"
            >
              <Plus size={20} />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-secondary text-wool/60 text-sm mb-4">
                Aún no tienes actividades
              </p>
              <Link
                href="/tracker"
                className="inline-block bg-wine hover:bg-wine-light text-wool font-secondary font-bold uppercase tracking-widest py-3 px-8 text-sm transition-all"
              >
                PRIMERA CARRERA
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="activity-card bg-dark/40 border border-chestnut/50 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="bg-wine/30 text-caramel font-display text-xs px-2 py-0.5 uppercase">
                        {activity.type}
                      </span>
                      <p className="font-secondary text-wool/40 text-xs mt-1">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="font-display text-lg text-wool">
                        {formatDistance(activity.distance)}
                      </p>
                      <p className="font-secondary text-[9px] text-wool/40 uppercase">
                        Distancia
                      </p>
                    </div>
                    <div className="border-x border-chestnut/30 text-center">
                      <p className="font-display text-lg text-wool">
                        {formatDuration(activity.duration)}
                      </p>
                      <p className="font-secondary text-[9px] text-wool/40 uppercase">
                        Tiempo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-caramel">
                        {formatPace(activity.avg_pace)}
                      </p>
                      <p className="font-secondary text-[9px] text-wool/40 uppercase">
                        Ritmo/km
                      </p>
                    </div>
                  </div>

                  {activity.notes && (
                    <p className="font-secondary text-wool/60 text-xs mt-2 pt-2 border-t border-chestnut/30">
                      {activity.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
