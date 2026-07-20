import { Link, Outlet, useNavigation } from "react-router-dom";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="mfe-dash-scope">
      <nav>
        <Link to="/">Overview</Link> | <Link to="/reports">Reports</Link> |{" "}
        <Link to="/settings">Settings</Link>
      </nav>
      {isLoading ? (
        <output className={styles.spinner}>
          <span className={styles.visuallyHidden}>Loading…</span>
        </output>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
