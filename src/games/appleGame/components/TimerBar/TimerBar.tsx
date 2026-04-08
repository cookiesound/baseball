import './TimerBar.scss';

interface TimerBarProps {
  time: number;
  /** 시작 시각 기준 총 제한 시간(초) — 진행률 계산용 */
  duration: number;
}

export function TimerBar({ time, duration }: TimerBarProps) {
  const max = duration > 0 ? duration : 1;
  const ratio = Math.max(0, Math.min(1, time / max));
  const urgent = time <= 10;

  return (
    <div className={`timer-bar ${urgent ? 'timer-bar--urgent' : ''}`} aria-label={`남은 시간 ${time}초`}>
      <div className="timer-bar__track">
        <div
          className="timer-bar__fill"
          style={{ ['--fill-ratio' as string]: String(ratio) }}
        />
      </div>
    </div>
  );
}
