import { Route, Routes } from "react-router-dom";

export default function MarketingApp() {
  return (
    <Routes>
      <Route path="/*" element={<h1>Marketing</h1>} />
    </Routes>
  );
}
