import { Route, Routes } from "react-router-dom";

export default function AuthApp() {
  return (
    <Routes>
      <Route path="/*" element={<h1>Authentication</h1>} />
    </Routes>
  );
}
