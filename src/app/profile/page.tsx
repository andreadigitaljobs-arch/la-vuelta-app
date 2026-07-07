"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance } from "@/lib/utils";
import { User, MapPin, Calendar, Settings } from "lucide-react";

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
          totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
          totalRuns: activities.length,
        });
      }
      setLoading(false);
    };

    fetchProfile();
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
        {/* Profile header */}
        <div className="bg-dark/50 border-b border-chestnut">
          <div className="max-w-lg mx-auto px-4 py-8 text-center">
            <div className="w-24 h-24 mx-auto bg-chestnut rounded-full flex items-center justify-center border-2 border-caramel mb-4">
              <span className="font-display text-3xl text-wool">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <h1 className="font-display text-2xl text-wool tracking-wider">
              {profile?.full_name || "Runner"}
            </h1>
            <p className="font-secondary text-caramel text-sm">
              @{profile?.username || "runner"}
            </p>
            {profile?.bio && (
              <p className="font-secondary text-wool/60 text-sm mt-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark/40 border border-chestnut/50 p-4 text-center">
              <p className="font-display text-3xl text-wool">
                {formatDistance(stats.totalDistance)}
              </p>
              <p className="font-secondary text-xs text-wool/40 uppercase tracking-wider mt-1">
                Distancia Total
              </p>
            </div>
            <div className="bg-dark/40 border border-chestnut/50 p-4 text-center">
              <p className="font-display text-3xl text-caramel">
                {stats.totalRuns}
              </p>
              <p className="font-secondary text-xs text-wool/40 uppercase tracking-wider mt-1">
                Carreras
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="bg-dark/40 border border-chestnut/50 p-4 flex items-center gap-3">
              <User size={18} className="text-caramel" />
              <div>
                <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                  Email
                </p>
                <p className="font-secondary text-wool text-sm">{user?.email}</p>
              </div>
            </div>

            {profile?.location && (
              <div className="bg-dark/40 border border-chestnut/50 p-4 flex items-center gap-3">
                <MapPin size={18} className="text-caramel" />
                <div>
                  <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                    Ubicación
                  </p>
                  <p className="font-secondary text-wool text-sm">{profile.location}</p>
                </div>
              </div>
            )}

            <div className="bg-dark/40 border border-chestnut/50 p-4 flex items-center gap-3">
              <Calendar size={18} className="text-caramel" />
              <div>
                <p className="font-secondary text-[10px] text-wool/40 uppercase tracking-wider">
                  Miembro desde
                </p>
                <p className="font-secondary text-wool text-sm">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })
                    : "2026"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
