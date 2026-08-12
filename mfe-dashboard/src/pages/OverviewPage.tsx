import { useEffect } from "react";
import { useSharedStore } from "../shared-store-context";
import styles from "../index.module.css";

export default function OverviewPage() {
  const store = useSharedStore();

  useEffect(() => {
    console.log("shared/store __id in mfe-dashboard:", store?.__id);
  }, [store]);

  return (
    <div className={styles.card}>
      <h1>Overview</h1>
      <p>Summary widgets would go here.</p>
    </div>
  );
}
