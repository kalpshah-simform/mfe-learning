import { useEffect } from "react";
import { store } from "shared/store";
import styles from "../index.module.css";

export default function OverviewPage() {
  useEffect(() => {
    console.log("shared/store __id in mfe-dashboard:", store.__id);
  }, []);

  return (
    <div className={styles.card}>
      <h1>Overview</h1>
      <p>Summary widgets would go here.</p>
    </div>
  );
}
