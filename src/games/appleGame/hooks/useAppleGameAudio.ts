import { useCallback, useEffect, useRef, useState } from "react";
/** `public/asset/` 정적 파일 URL */
function publicAsset(filename: string): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/")
    ? `${base}asset/${filename}`
    : `${base}/asset/${filename}`;
}

const appleBgmUrl = publicAsset("apple_bgm.mp3");
const countDownUrl = publicAsset("count_down.mp3");
const appleGameOverUrl = publicAsset("apple_gameover.mp3");
const applePopUrl = publicAsset("apple_pop.wav");
const applePopFailUrl = publicAsset("apple_pop_fail.wav");

/** BGM만 UI 볼륨 대비 기본적으로 30% 낮춤 (사용자 슬라이더 × 0.7) */
const BGM_LOUDNESS_SCALE = 0.7;

const STORAGE_MUTED = "appleGameMuted";
const STORAGE_VOLUME = "appleGameVolume";

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_MUTED) === "1";
  } catch {
    return false;
  }
}

function readVolume(): number {
  try {
    const v = localStorage.getItem(STORAGE_VOLUME);
    if (v == null) return 0.75;
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.75;
  } catch {
    return 0.75;
  }
}

export function useAppleGameAudio() {
  const [muted, setMutedState] = useState(readMuted);
  const [volume, setVolumeState] = useState(readVolume);

  const eff = muted ? 0 : volume;
  const effRef = useRef(eff);
  effRef.current = eff;

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MUTED, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VOLUME, String(volume));
    } catch {
      /* ignore */
    }
  }, [volume]);

  useEffect(() => {
    const el = new Audio(appleBgmUrl);
    el.loop = true;
    el.preload = "auto";
    bgmRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      bgmRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = bgmRef.current;
    if (!el) return;
    el.volume = Math.min(1, eff * BGM_LOUDNESS_SCALE);
  }, [eff]);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  const playSfx = useCallback((url: string) => {
    const v = effRef.current;
    if (v <= 0) return;
    const a = new Audio(url);
    a.volume = v;
    void a.play().catch(() => {});
  }, []);

  const playPop = useCallback(() => playSfx(applePopUrl), [playSfx]);
  const playFail = useCallback(() => playSfx(applePopFailUrl), [playSfx]);
  const playCountdown = useCallback(() => playSfx(countDownUrl), [playSfx]);
  const playGameOver = useCallback(() => playSfx(appleGameOverUrl), [playSfx]);

  const startBgm = useCallback(() => {
    const el = bgmRef.current;
    if (!el) return;
    el.volume = Math.min(1, effRef.current * BGM_LOUDNESS_SCALE);
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, []);

  const stopBgm = useCallback(() => {
    const el = bgmRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return {
    muted,
    setMuted,
    volume,
    setVolume,
    playPop,
    playFail,
    playCountdown,
    playGameOver,
    startBgm,
    stopBgm,
  };
}
