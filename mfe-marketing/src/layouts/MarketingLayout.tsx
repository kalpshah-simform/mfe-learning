import { Link, Outlet } from "react-router-dom";
import { GlobalStyle } from "../marketing.styles";

export default function MarketingLayout() {
  return (
    <>
      <GlobalStyle />
      <nav>
        <Link to="/">Home</Link> | <Link to="/pricing">Pricing</Link> |{" "}
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </>
  );
}
