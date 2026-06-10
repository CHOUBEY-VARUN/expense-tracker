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

  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const result = await fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        title,
        amount,
        category,
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      console.log(data.message);
    }
  };

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
  }, [navigate,totals]);

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

      <section>
        <h2>Income</h2>

        {incomes.length === 0 ? (
          <p>No income transactions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td>{income.title}</td>
                  <td>{income.category ?? "Uncategorized"}</td>
                  <td>{formatAmount(income.amount)}</td>
                  <td>{income.transaction_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Expenses</h2>

        {expenses.length === 0 ? (
          <p>No expense transactions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td>{expense.category ?? "Uncategorized"}</td>
                  <td>{formatAmount(expense.amount)}</td>
                  <td>{expense.transaction_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div>
        <form onSubmit={handleSubmit}>
          <label>
            <input
              type="radio"
              name="type"
              value="income"
              checked={type === "income"}
              onChange={(e) => setType(e.target.value)}
            />
            Income
          </label>

          <label>
            <input
              type="radio"
              name="type"
              value="expense"
              checked={type === "expense"}
              onChange={(e) => setType(e.target.value)}
            />
            Expense
          </label>
          <label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            Title
          </label>
          <label>
            <input
              type="number"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            Amount
          </label>

          <label>Category</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      </div>
      <Logout />
    </div>
  );
}

export default Dashboard;
