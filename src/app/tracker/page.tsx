"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { Play, Pause, Square, MapPin, Clock, Zap, Navigation2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-dark/50 flex items-center justify-center">
      <p className="text-wool/40 font-secondary text-sm">Cargando mapa...</p>
    </div>
  ),
});

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

export default function TrackerPage() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const watchRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef(0);
  const lastPositionRef = useRef<Position | null>(null);
  const supabase = createClient();

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const newPos: Position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
      };

      setPositions((prev) => {
        if (lastPositionRef.current) {
          const dist = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newPos.lat,
            newPos.lng
          );
          if (dist > 2) {
            setDistance((d) => d + dist);
          }
        }
        lastPositionRef.current = newPos;
        return [...prev, newPos];
      });
    },
    []
  );

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setPositions([]);
    setDistance(0);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    lastPositionRef.current = null;

    watchRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedTime(
          Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000)
        );
      }
    }, 1000);
  };

  const pauseTracking = () => {
    if (isPaused) {
      startTimeRef.current = Date.now();
      setIsPaused(false);
    } else {
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTracking(false);
    setIsPaused(false);
  };

  const saveActivity = async () => {
    if (!user || distance < 10) return;

    setSaving(true);
    const avgPace = elapsedTime > 0 ? (distance / 1000) / (elapsedTime / 3600) : 0;

    const { error } = await supabase.from("activities").insert({
      user_id: user.id,
      type: "run",
      distance,
      duration: elapsedTime,
      avg_pace: avgPace > 0 ? 1000 / avgPace : 0,
      calories: Math.round(distance * 0.075),
      notes: notes || null,
      route_coordinates: positions,
    });

    if (!error) {
      setPositions([]);
      setDistance(0);
      setElapsedTime(0);
      setNotes("");
      window.location.href = "/feed";
    }
    setSaving(false);
  };

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const avgPace = distance > 0 && elapsedTime > 0 ? elapsedTime / (distance / 1000) : 0;

  return (
    <div className="min-h-screen bg-fire">
      <Navigation />

      <main className="pt-14 pb-20 h-screen flex flex-col">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView positions={positions} isTracking={isTracking} />

          {/* Live stats overlay */}
          {isTracking && (
            <div className="absolute top-4 left-4 right-4 bg-dark/80 backdrop-blur-sm border border-chestnut p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-2xl text-wool">
                    {formatDistance(distance)}
                  </p>
                  <p className="font-secondary text-[9px] text-wool/40 uppercase">
                    Distancia
                  </p>
                </div>
                <div className="border-x border-chestnut/50">
                  <p className="font-display text-2xl text-wool">
                    {formatDuration(elapsedTime)}
                  </p>
                  <p className="font-secondary text-[9px] text-wool/40 uppercase">
                    Tiempo
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl text-caramel">
                    {avgPace > 0 ? formatPace(1000 / avgPace) : "0:00"}
                  </p>
                  <p className="font-secondary text-[9px] text-wool/40 uppercase">
                    Ritmo/km
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Position indicator */}
          {isTracking && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-wine rounded-full" />
                <div className="absolute inset-0 w-4 h-4 bg-wine rounded-full pulse-ring" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-dark border-t border-chestnut p-4">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="w-full bg-wine hover:bg-wine-light text-wool font-secondary font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-3 transition-all"
            >
              <Play size={20} fill="currentColor" />
              INICIAR CARRERA
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={pauseTracking}
                  className="flex-1 bg-chestnut hover:bg-chestnut/80 text-wool font-secondary font-semibold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-all text-sm"
                >
                  {isPaused ? (
                    <>
                      <Play size={16} /> CONTINUAR
                    </>
                  ) : (
                    <>
                      <Pause size={16} /> PAUSAR
                    </>
                  )}
                </button>
                <button
                  onClick={stopTracking}
                  className="flex-1 bg-wine hover:bg-wine-light text-wool font-secondary font-semibold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Square size={16} /> DETENER
                </button>
              </div>

              {distance > 10 && !isPaused && (
                <div className="space-y-3 pt-2 border-t border-chestnut/50">
                  <input
                    type="text"
                    placeholder="Agregar nota (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-dark/50 border border-chestnut text-wool placeholder-wool/40 px-4 py-2.5 font-secondary text-sm focus:outline-none focus:border-caramel transition-colors"
                  />
                  <button
                    onClick={saveActivity}
                    disabled={saving}
                    className="w-full bg-caramel hover:bg-caramel/80 disabled:opacity-50 text-fire font-secondary font-bold uppercase tracking-widest py-3 transition-all text-sm"
                  >
                    {saving ? "GUARDANDO..." : "GUARDAR ACTIVIDAD"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
