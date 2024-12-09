import styles from './styles.module.css';

interface HeaderProps {
  score: number;
  highScore: number;
}

export function Header({ score, highScore }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        <h1>2048</h1>
        <img
          src={`${import.meta.env.BASE_URL}qr_code.webp`}
          alt="QR Code"
          className={styles.qrCode}
        />
      </div>
      <div className={styles.scores}>
        <div className={styles.scoreContainer}>
          <div className={styles.scoreLabel}>SCORE</div>
          <div className={styles.score}>{score}</div>
        </div>
        <div className={styles.scoreContainer}>
          <div className={styles.scoreLabel}>BEST</div>
          <div className={styles.score}>{highScore}</div>
        </div>
      </div>
    </div>
  );
}
