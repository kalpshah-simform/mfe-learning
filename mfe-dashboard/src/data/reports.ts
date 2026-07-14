export interface Report {
  id: string;
  title: string;
  summary: string;
}

export const reports: Report[] = [
  { id: "1", title: "Q1 Revenue", summary: "Quarterly revenue breakdown by region." },
  { id: "2", title: "User Growth", summary: "Monthly active user trends." },
  { id: "3", title: "Churn Analysis", summary: "Cohort retention and churn drivers." },
];

export function findReport(id: string): Report | undefined {
  return reports.find((report) => report.id === id);
}
