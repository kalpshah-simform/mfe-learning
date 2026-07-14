import { Link } from "react-router-dom";
import styles from "../index.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.card}>
      <h1>Settings</h1>
      <p>
        <Link to="profile">Edit profile settings</Link>
      </p>
    </div>
  );
}
