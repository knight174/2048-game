import styles from './styles.module.css';

interface ControlsProps {
  onNewGame: () => void;
}

export function Controls({ onNewGame }: ControlsProps) {
  return (
    <div className={styles.controls}>
      <button onClick={onNewGame} className={styles.newGameBtn}>
        新 游 戏
      </button>
    </div>
  );
}
