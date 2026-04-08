import './ScoreDisplay.scss';

interface ScoreDisplayProps {
  score: number;
  time: number;
}

export function ScoreDisplay({ score, time }: ScoreDisplayProps) {
  return (
    <div className="score-text">
      <span className="score-text__item">Score: {score}</span>
      <span className="score-text__item">Time: {time}</span>
    </div>
  );
}
