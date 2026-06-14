import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API_BASE_URL from "../config/api";

function Login() {
  const navigate = useNavigate();
  const handleLogin = async (username: string, password: string) => {
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
      console.log(data.message);
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    }
  };
  return (
    <>
      <AuthForm title="Login" buttonText="Login" onSubmit={handleLogin} />
    </>
  );
}

export default Login;
