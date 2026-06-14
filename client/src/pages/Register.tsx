import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API_BASE_URL from "../config/api";

function Register() {
  const navigate = useNavigate();
  const handleRegister = async (username: string, password: string) => {
    const result = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await result.json();
    if (!result.ok) {
      console.log(data.message);
      return;
    }

    console.log("User registered:", data);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
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
