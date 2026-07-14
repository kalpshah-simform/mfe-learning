import styles from "../index.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.card}>
      <h1>Not found</h1>
      <p>This dashboard route doesn't exist.</p>
    </div>
  );
}
