import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  };

  return(
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Logout;
