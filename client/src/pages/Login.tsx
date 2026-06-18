import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API_BASE_URL from "../config/api";

function Login() {
  const navigate = useNavigate();
  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        return {
          ok: false,
          message: data.message || "Login failed. Please check your details.",
        };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");

      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "Could not connect to the server. Please try again.",
      };
    }
  };

  return (
    <>
      <AuthForm title="Login" buttonText="Login" onSubmit={handleLogin} />
    </>
  );
}

export default Login;
