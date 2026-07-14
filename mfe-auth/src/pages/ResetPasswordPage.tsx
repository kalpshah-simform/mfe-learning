import { useParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="mfe-auth-card">
      <h1>Reset password</h1>
      <p>
        Reset token: <code>{token}</code>
      </p>
    </div>
  );
}
