import { Link } from "react-router-dom";

export default function AuthLandingPage() {
  return (
    <div className="mfe-auth-card">
      <h1>Authentication</h1>
      <p>Choose an action to continue.</p>
      <ul>
        <li>
          <Link to="login">Log in</Link>
        </li>
        <li>
          <Link to="signup">Sign up</Link>
        </li>
        <li>
          <Link to="forgot-password">Forgot password</Link>
        </li>
      </ul>
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("auth:login", { detail: { userId: "test123" } }),
          )
        }
      >
        Simulate Login
      </button>
    </div>
  );
}
