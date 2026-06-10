import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logout from "../components/Logout";

type User = {
  id: number;
  username: string;
};

type Transaction = {
  id: number;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string | null;
  transaction_date: string;
  created_at: string;
};

type Totals = {
  income: number;
  expense: number;
  balance: number;
};

type DashboardData = {
  user: User;
  incomes: Transaction[];
  expenses: Transaction[];
  totals: Totals;
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const result = await fetch("http://localhost:3000/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!result.ok) {
          navigate("/login");
          return;
        }

        const data: DashboardData = await result.json();

        setUser(data.user);
        setIncomes(data.incomes);
        setExpenses(data.expenses);
        setTotals(data.totals);
      } catch {
        setError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [navigate]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Welcome, {user?.username}</h2>

      <section>
        <h2>Balance Summary</h2>

        <p>Total Income: {formatAmount(totals?.income ?? 0)}</p>
        <p>Total Expenses: {formatAmount(totals?.expense ?? 0)}</p>
        <p>Current Balance: {formatAmount(totals?.balance ?? 0)}</p>
      </section>


      <Logout />
    </div>
  );
}

export default Dashboard;
