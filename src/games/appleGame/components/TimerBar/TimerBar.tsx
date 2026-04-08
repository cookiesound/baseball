import { APPLE_GAME_DURATION } from '../../types/appleGameTypes';
import './TimerBar.scss';

interface TimerBarProps {
  time: number;
}

export function TimerBar({ time }: TimerBarProps) {
  const ratio = Math.max(0, Math.min(1, time / APPLE_GAME_DURATION));
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
