"use client";

import { Navigation } from "@/components/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { Clock, MapPin, Pause, Play, Square, Zap } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-dark/70">
      <p className="font-secondary text-sm text-wool/45">Cargando mapa...</p>
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
    <div className="min-h-screen bg-dark">
      <Navigation />

      <main className="flex h-screen flex-col pb-[72px] pt-16">
        <div className="relative flex-1 overflow-hidden">
          <MapView positions={positions} isTracking={isTracking} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark/65 via-transparent to-dark/82" />

          <div className="absolute left-4 right-4 top-4">
            <div className="brand-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Tracker GPS</p>
                  <h1 className="display-title text-4xl text-cream">
                    {isTracking ? (isPaused ? "Pausado" : "En vivo") : "Nueva vuelta"}
                  </h1>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-caramel/30 bg-wine/35">
                  <MapPin size={18} className="text-caramel" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="metric-card p-3">
                  <MapPin size={14} className="mb-1 text-caramel" />
                  <p className="display-title text-2xl text-cream">
                    {formatDistance(distance)}
                  </p>
                  <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                    Distancia
                  </p>
                </div>
                <div className="metric-card p-3">
                  <Clock size={14} className="mb-1 text-caramel" />
                  <p className="display-title text-2xl text-cream">
                    {formatDuration(elapsedTime)}
                  </p>
                  <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                    Tiempo
                  </p>
                </div>
                <div className="metric-card p-3">
                  <Zap size={14} className="mb-1 text-caramel" />
                  <p className="display-title text-2xl text-caramel">
                    {avgPace > 0 ? formatPace(1000 / avgPace) : "0:00"}
                  </p>
                  <p className="font-secondary text-[9px] uppercase tracking-[0.15em] text-wool/42">
                    Ritmo/km
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isTracking && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-wine rounded-full" />
                <div className="absolute inset-0 w-4 h-4 bg-wine rounded-full pulse-ring" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-wool/10 bg-dark/96 p-4">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="brand-button w-full py-4"
            >
              <Play size={20} fill="currentColor" />
              Iniciar carrera
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={pauseTracking}
                  className="ghost-button flex-1 py-3"
                >
                  {isPaused ? (
                    <>
                      <Play size={16} /> Continuar
                    </>
                  ) : (
                    <>
                      <Pause size={16} /> Pausar
                    </>
                  )}
                </button>
                <button
                  onClick={stopTracking}
                  className="brand-button flex-1 py-3"
                >
                  <Square size={16} /> Detener
                </button>
              </div>

              {distance > 10 && !isPaused && (
                <div className="space-y-3 border-t border-wool/10 pt-3">
                  <input
                    type="text"
                    placeholder="Agregar nota (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="brand-input"
                  />
                  <button
                    onClick={saveActivity}
                    disabled={saving}
                    className="w-full bg-caramel px-4 py-3 font-secondary text-sm font-extrabold uppercase tracking-[0.14em] text-fire transition hover:bg-wool disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar actividad"}
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
