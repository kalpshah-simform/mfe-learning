import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="mfe-auth-card">
      <h1>Sign up</h1>
      <form>
        <div className="mb-3">
          <label htmlFor="signup-name" className="form-label">
            Name
          </label>
          <input id="signup-name" type="text" className="form-control" />
        </div>
        <div className="mb-3">
          <label htmlFor="signup-email" className="form-label">
            Email
          </label>
          <input id="signup-email" type="email" className="form-control" />
        </div>
        <div className="mb-3">
          <label htmlFor="signup-password" className="form-label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="signup-confirm-password" className="form-label">
            Confirm Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
