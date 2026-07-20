import { Link, Outlet, useNavigation } from "react-router-dom";
import { GlobalStyle, Spinner } from "../marketing.styles";

export default function MarketingLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      <GlobalStyle />
      <nav>
        <Link to="/">Home</Link> | <Link to="/pricing">Pricing</Link> |{" "}
        <Link to="/about">About</Link>
      </nav>
      {isLoading ? <Spinner /> : <Outlet />}
    </>
  );
}
