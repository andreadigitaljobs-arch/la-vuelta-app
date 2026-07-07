"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance } from "@/lib/utils";
import { Trophy, Medal, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  total_distance: number;
  total_runs: number;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      let query = supabase.from("activities").select("user_id, distance");

      if (period === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (period === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data: activities } = await query;

      if (activities) {
        const userStats: Record<string, { total_distance: number; total_runs: number }> = {};

        activities.forEach((a) => {
          if (!userStats[a.user_id]) {
            userStats[a.user_id] = { total_distance: 0, total_runs: 0 };
          }
          userStats[a.user_id].total_distance += a.distance;
          userStats[a.user_id].total_runs += 1;
        });

        const sorted = Object.entries(userStats)
          .map(([user_id, stats]) => ({ user_id, ...stats }))
          .sort((a, b) => b.total_distance - a.total_distance)
          .slice(0, 20);

        const userIds = sorted.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const result: LeaderboardEntry[] = sorted.map((s) => ({
          ...s,
          profiles: profileMap.get(s.user_id) || {
            full_name: "Runner",
            username: "runner",
            avatar_url: null,
          },
        }));

        setLeaders(result);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [period, supabase]);

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-amber-600";
    return "text-wool/40";
  };

  return (
    <div className="min-h-screen bg-fire">
      <Navigation />

      <main className="pt-14 pb-20">
        {/* Header */}
        <div className="bg-wine border-b border-wool/20">
          <div className="max-w-lg mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy size={24} className="text-caramel" />
              <h1 className="font-display text-2xl text-wool tracking-wider">
                RANKING
              </h1>
            </div>

            {/* Period selector */}
            <div className="flex gap-2">
              {[
                { key: "week" as const, label: "SEMANA" },
                { key: "month" as const, label: "MES" },
                { key: "all" as const, label: "TODO" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`font-secondary text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-all ${
                    period === p.key
                      ? "bg-wool text-fire"
                      : "bg-transparent border border-wool/30 text-wool/60 hover:border-wool"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-lg mx-auto px-4 py-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-wool font-display text-xl animate-pulse">
                CARGANDO...
              </div>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-16">
              <Trophy size={40} className="mx-auto text-wool/20 mb-4" />
              <p className="font-secondary text-wool/60 text-sm">
                No hay actividad en este período
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaders.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`activity-card flex items-center gap-3 p-3 border ${
                    entry.user_id === user?.id
                      ? "bg-wine/20 border-wine/50"
                      : "bg-dark/40 border-chestnut/50"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {index < 3 ? (
                      <Medal size={20} className={`mx-auto ${getMedalColor(index)}`} />
                    ) : (
                      <span className="font-display text-lg text-wool/40">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-chestnut rounded-full flex items-center justify-center">
                    <span className="font-display text-sm text-wool">
                      {entry.profiles?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-secondary font-semibold text-wool text-sm truncate">
                      {entry.profiles?.full_name || "Runner"}
                      {entry.user_id === user?.id && (
                        <span className="text-caramel ml-1">(Tú)</span>
                      )}
                    </p>
                    <p className="font-secondary text-wool/40 text-xs">
                      @{entry.profiles?.username || "runner"} · {entry.total_runs} carreras
                    </p>
                  </div>

                  {/* Distance */}
                  <div className="text-right">
                    <p className="font-display text-lg text-caramel">
                      {formatDistance(entry.total_distance)}
                    </p>
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
