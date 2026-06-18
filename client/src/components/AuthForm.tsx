import { useState } from "react";

type AuthSubmitResult = {
  ok: boolean;
  message?: string;
};

type AuthFormProps = {
  title: string;
  buttonText: string;
  onSubmit: (username: string, password: string) => Promise<AuthSubmitResult>;
};

type FieldErrors = {
  username?: string;
  password?: string;
};

function AuthForm({ title, buttonText, onSubmit }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errors: FieldErrors = {};

    if (!username.trim()) {
      errors.username = "Username is required.";
    }

    if (!password.trim()) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await onSubmit(username.trim(), password);

      if (!result.ok) {
        setFormMessage(result.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="user-auth">
        <p className="eyebrow">Account Access</p>
        <h1>{title}</h1>

        {formMessage && (
          <p className="form-alert form-alert-error">{formMessage}</p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Username</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              aria-invalid={fieldErrors.username ? "true" : "false"}
              onChange={(e) => {
                setUsername(e.target.value);
                setFieldErrors((current) => ({ ...current, username: "" }));
                setFormMessage("");
              }}
            />
            {fieldErrors.username && (
              <small className="form-error">{fieldErrors.username}</small>
            )}
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              aria-invalid={fieldErrors.password ? "true" : "false"}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: "" }));
                setFormMessage("");
              }}
            />
            {fieldErrors.password && (
              <small className="form-error">{fieldErrors.password}</small>
            )}
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : buttonText}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AuthForm;
