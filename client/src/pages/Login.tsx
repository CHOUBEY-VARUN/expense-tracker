import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function Login() {
  const navigate = useNavigate();
  const handleLogin = async (username: string, password: string) => {
    const result = await fetch("http://localhost:3000/api/login", {
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
      navigate("/");
    }
  };
  return (
    <>
      <AuthForm title="Login" buttonText="Login" onSubmit={handleLogin} />
    </>
  );
}

export default Login;
