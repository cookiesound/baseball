import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(initialSeconds: number, isRunning: boolean, onTimeUp: () => void) {
  const [time, setTime] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const reset = useCallback((value: number = initialSeconds) => {
    setTime(value);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        if (t <= 0) return 0;
        if (t === 1) {
          window.clearInterval(id);
          queueMicrotask(() => onTimeUpRef.current());
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  return { time, reset };
}
