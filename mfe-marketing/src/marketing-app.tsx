import { Route, Routes } from "react-router-dom";
import { GlobalStyle } from "./marketing.styles";

export default function MarketingApp() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/*" element={<h1>Marketing</h1>} />
      </Routes>
    </>
  );
}
