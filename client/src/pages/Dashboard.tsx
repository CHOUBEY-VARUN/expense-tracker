import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logout from "../components/Logout";
import API_BASE_URL from "../config/api";
import DeleteBtn from "../components/DeleteBtn";

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

type TransactionFormErrors = {
  type?: string;
  title?: string;
  amount?: string;
  category?: string;
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
  const [formErrors, setFormErrors] = useState<TransactionFormErrors>({});
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState<"success" | "error">(
    "error",
  );
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const targetBalance = 10000;

  const currentBalance = totals?.balance ?? 0;

  const balanceProgressRaw = Math.min(
    Math.max((currentBalance / targetBalance) * 100, 0),
    100
  );

  const balanceProgress = Math.floor(balanceProgressRaw);

  const validateTransactionForm = () => {
    const errors: TransactionFormErrors = {};
    const numericAmount = Number(amount);

    if (!type) {
      errors.type = "Choose income or expense.";
    }

    if (!title.trim()) {
      errors.title = "Title is required.";
    }

    if (!amount.trim()) {
      errors.amount = "Amount is required.";
    } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      errors.amount = "Amount must be greater than 0.";
    }

    if (!category) {
      errors.category = "Category is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");

    if (!validateTransactionForm()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSubmittingTransaction(true);

      const result = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          amount,
          category,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        setFormMessageType("error");
        setFormMessage(
          data.message || "Could not add transaction. Please try again.",
        );
        return;
      }

      setType("");
      setTitle("");
      setAmount("");
      setCategory("");
      setFormErrors({});
      setFormMessageType("success");
      setFormMessage("Transaction added successfully.");
    } catch {
      setFormMessageType("error");
      setFormMessage("Could not connect to the server. Please try again.");
    } finally {
      setSubmittingTransaction(false);
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
        const result = await fetch(`${API_BASE_URL}/api/transactions`, {
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
  }, [navigate, totals]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatTransactionDate = (date: string) => {
    const dateOnly = date.slice(0, 10);
    const dateMatch = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!dateMatch) {
      return date;
    }

    const monthIndex = Number(dateMatch[2]) - 1;
    const day = Number(dateMatch[3]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[monthIndex];

    if (!month) {
      return date;
    }

    return `${day} ${month}`;
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Personal Finance</p>
          <h1>Dashboard</h1>
          <h2>Welcome, {user?.username}</h2>
        </div>

        <Logout />
      </header>

      <section className="summary-grid" aria-label="Balance summary">
        <article className="metric-card metric-card-income">
          <span>Total Income</span>
          <strong>{formatAmount(totals?.income ?? 0)}</strong>
        </article>

        <article className="metric-card metric-card-expense">
          <span>Total Expenses</span>
          <strong>{formatAmount(totals?.expense ?? 0)}</strong>
        </article>

        <article className="metric-card metric-card-balance">
          <span>Current Balance</span>
          <strong>{formatAmount(totals?.balance ?? 0)}</strong>
        </article>

        <article className="metric-card goal-card">
          <div className="goal-card-header">
            <span>Savings Goal</span>
            <strong>{balanceProgress.toFixed(0)}%</strong>
          </div>

          <div className="balance-progress-container">
            <div
              className="balance-progress-fill"
              style={{ width: `${balanceProgress}%` }}
            ></div>
          </div>

          <p>{formatAmount(targetBalance)} target</p>
        </article>
      </section>

      <div className="dashboard-content">
        <section className="panel table-panel">
          <div className="panel-header">
            <h2>Income</h2>
            <span>{incomes.length} entries</span>
          </div>

          {incomes.length === 0 ? (
            <p className="empty-state">No income transactions yet.</p>
          ) : (
            <div className="table-wrap">
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
                      <td>{formatTransactionDate(income.transaction_date)}</td>
                      <DeleteBtn transactionId={income.id}/>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <h2>Expenses</h2>
            <span>{expenses.length} entries</span>
          </div>

          {expenses.length === 0 ? (
            <p className="empty-state">No expense transactions yet.</p>
          ) : (
            <div className="table-wrap">
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
                      <td>{formatTransactionDate(expense.transaction_date)}</td>
                      <DeleteBtn transactionId={expense.id}/>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="panel transaction-panel">
        <div className="panel-header">
          <h2>Add Transaction</h2>
        </div>

        {formMessage && (
          <p className={`form-alert form-alert-${formMessageType}`}>
            {formMessage}
          </p>
        )}

        <form className="transaction-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field transaction-type-field">
            <div className="type-toggle">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === "income"}
                  onChange={(e) => {
                    setType(e.target.value);
                    setFormErrors((current) => ({ ...current, type: "" }));
                    setFormMessage("");
                  }}
                />
                <span>Income</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === "expense"}
                  onChange={(e) => {
                    setType(e.target.value);
                    setFormErrors((current) => ({ ...current, type: "" }));
                    setFormMessage("");
                  }}
                />
                <span>Expense</span>
              </label>
            </div>
            {formErrors.type && (
              <small className="form-error">{formErrors.type}</small>
            )}
          </div>

          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={title}
              aria-invalid={formErrors.title ? "true" : "false"}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormErrors((current) => ({ ...current, title: "" }));
                setFormMessage("");
              }}
            />
            {formErrors.title && (
              <small className="form-error">{formErrors.title}</small>
            )}
          </label>

          <label className="form-field">
            <span>Amount</span>
            <input
              type="number"
              name="amount"
              value={amount}
              min="0"
              step="0.01"
              aria-invalid={formErrors.amount ? "true" : "false"}
              onChange={(e) => {
                setAmount(e.target.value);
                setFormErrors((current) => ({ ...current, amount: "" }));
                setFormMessage("");
              }}
            />
            {formErrors.amount && (
              <small className="form-error">{formErrors.amount}</small>
            )}
          </label>

          <label className="form-field">
            <span>Category</span>
            <select
              value={category}
              aria-invalid={formErrors.category ? "true" : "false"}
              onChange={(e) => {
                setCategory(e.target.value);
                setFormErrors((current) => ({ ...current, category: "" }));
                setFormMessage("");
              }}
            >
              <option value="">Select category</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="shopping">Shopping</option>
              <option value="bills">Bills</option>
            </select>
            {formErrors.category && (
              <small className="form-error">{formErrors.category}</small>
            )}
          </label>

          <button type="submit" disabled={submittingTransaction}>
            {submittingTransaction ? "Submitting..." : "Submit"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Dashboard;
