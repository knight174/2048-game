import styles from './styles.module.css';

interface TileProps {
  value: number;
}

export function Tile({ value }: TileProps) {
  return (
    <div
      className={`${styles.tile} ${value > 0 ? styles[`tile-${value}`] : ''}`}
    >
      {value || ''}
    </div>
  );
}
