import { Link } from "react-router-dom";
import styles from "../index.module.css";
import { reports } from "../data/reports";

export default function ReportsListPage() {
  return (
    <div className={styles.card}>
      <h1>Reports</h1>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            <Link to={report.id}>{report.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
