import { Route, Routes } from "react-router-dom";

export default function AuthApp() {
  return (
    <div className="mfe-auth-scope">
      <Routes>
        <Route
          path="/*"
          element={
            <div className="mfe-auth-card">
              <h1>Authentication</h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
