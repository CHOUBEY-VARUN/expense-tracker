import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logout from "../components/Logout";

type User = {
  id: number;
  username: string;
};


function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const result = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!result.ok) {
          navigate("/login");
          return;
        }

        const data = await result.json();
        setUser(data.user);
      } catch {
        setError("error");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]);

  if(loading){return <p>Loading...</p>}
  if(error){return <p>{error}</p>}

  return(
    <div>
      <h1>Dashboard</h1>
      <h2>Welcome, {user?.username}</h2>
      <Logout/>
    </div>
  )
}

export default Dashboard;
