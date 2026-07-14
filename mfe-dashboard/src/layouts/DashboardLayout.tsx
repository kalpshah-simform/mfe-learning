import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="mfe-dash-scope">
      <nav>
        <Link to="/">Overview</Link> | <Link to="/reports">Reports</Link> |{" "}
        <Link to="/settings">Settings</Link>
      </nav>
      <Outlet />
    </div>
  );
}
