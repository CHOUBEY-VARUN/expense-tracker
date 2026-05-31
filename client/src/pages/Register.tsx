import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function Register() {
  const navigate = useNavigate();
  const handleRegister = async (username: string, password: string) => {
    const result = await fetch("http://localhost:3000/api/register", {
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
    localStorage.setItem("user", JSON.stringify(data.data));
    navigate("/");
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
