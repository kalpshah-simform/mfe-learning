import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { useAuthChange } from "../auth-change-context";

export default function LoginPage() {
  const onAuthChange = useAuthChange();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    // No backend to authenticate against — any non-empty email/password
    // "succeeds", simulating a real login response.
    onAuthChange?.({ isAuthenticated: true, userId: email });
  }

  return (
    <div className="mfe-auth-card">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Log In
        </button>
      </form>
      <p className="mt-3">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
