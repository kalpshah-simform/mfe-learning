import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className="mfe-auth-card">
      <h1>Forgot password</h1>
      <p>Enter your email and we'd send a reset link (placeholder).</p>
      <form>
        <div className="mb-3">
          <label htmlFor="forgot-password-email" className="form-label">
            Email
          </label>
          <input
            id="forgot-password-email"
            type="email"
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Send Reset Link
        </button>
      </form>
      <p className="mt-3">
        <Link to="/login">Back to Log in</Link>
      </p>
    </div>
  );
}
