import { useEffect } from "react";
import { Link } from "react-router-dom";
import { store } from "shared/store";

function dispatchLoginEvent() {
  window.dispatchEvent(
    new CustomEvent("auth:login", { detail: { userId: "test123" } }),
  );
}

export default function AuthLandingPage() {
  useEffect(() => {
    console.log("shared/store __id in mfe-auth:", store.__id);
  }, []);

  useEffect(() => {
    // Simulates auth's real login flow completing shortly after page load —
    // e.g. a token refresh or SSO redirect resolving. Fires whether or not
    // dashboard happens to be mounted yet, which is exactly the late-subscriber
    // bug this exercise reproduces: a one-shot event has no memory, so any
    // listener that isn't attached at the moment of dispatch simply misses it.
    const timer = setTimeout(dispatchLoginEvent, 500);
    return () => clearTimeout(timer);
  }, []);

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
      <button type="button" onClick={dispatchLoginEvent}>
        Simulate Login
      </button>
    </div>
  );
}
