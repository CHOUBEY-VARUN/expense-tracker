import { useState } from "react";

type AuthFormProps = {
  title: string;
  buttonText: string;
  onSubmit: (username: string, password: string) => void;
};

function AuthForm({ title, buttonText, onSubmit }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <main className="auth-page">
      <div className="user-auth">
        <p className="eyebrow">Account Access</p>
        <h1>{title}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username :"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password :"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <button type="submit">{buttonText}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AuthForm;
