import { Routes, Route } from "react-router-dom";
import styles from "./index.module.css";

export default function DashboardApp() {
  return (
    <div className="mfe-dash-scope">
      <Routes>
        <Route
          path="/*"
          element={
            <div className={styles.card}>
              <h1>Dashboard</h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
