import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Expense Tracker</h1>

      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;