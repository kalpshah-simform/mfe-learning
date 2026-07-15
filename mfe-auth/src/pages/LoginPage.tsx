import { useAuthChange } from "../auth-change-context";

export default function LoginPage() {
  const onAuthChange = useAuthChange();

  return (
    <div className="mfe-auth-card">
      <h1>Log in</h1>
      <p>Placeholder login form would go here.</p>
      <button
        type="button"
        onClick={() =>
          onAuthChange?.({ isAuthenticated: true, userId: "test123" })
        }
      >
        Simulate Auth Change
      </button>
    </div>
  );
}
