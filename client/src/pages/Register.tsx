import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API_BASE_URL from "../config/api";

function Register() {
  const navigate = useNavigate();
  const handleRegister = async (username: string, password: string) => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await result.json();

      if (!result.ok) {
        return {
          ok: false,
          message: data.message || "Registration failed. Please try again.",
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
      <AuthForm
        title="Register"
        buttonText="Create new user"
        onSubmit={handleRegister}
      />
    </>
  );
}

export default Register;
