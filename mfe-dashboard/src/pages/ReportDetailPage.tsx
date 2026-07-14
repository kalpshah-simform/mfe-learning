import { useParams } from "react-router-dom";
import styles from "../index.module.css";
import { findReport } from "../data/reports";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const report = id ? findReport(id) : undefined;

  if (!report) {
    return (
      <div className={styles.card}>
        <h1>Report not found</h1>
        <p>No report with id "{id}".</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1>{report.title}</h1>
      <p>{report.summary}</p>
    </div>
  );
}
