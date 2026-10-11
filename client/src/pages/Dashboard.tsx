import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logout from "../components/Logout";
import API_BASE_URL from "../config/api";
import DeleteBtn from "../components/DeleteBtn";
import {
  balanceProgressPercent,
  formatMoney,
  normalizeApiMoney,
  type ApiMoneyValue,
  type MoneyValue,
} from "../lib/money";

type User = {
  id: number;
  username: string;
};

type Transaction = {
  id: number;
  type: "income" | "expense";
  title: string;
  amount: MoneyValue;
  category: string | null;
  transaction_date: string;
  created_at: string;
};

type Totals = {
  income: MoneyValue;
  expense: MoneyValue;
  balance: MoneyValue;
};

type ApiTransaction = Omit<Transaction, "amount"> & { amount: ApiMoneyValue };

type ApiDashboardData = {
  user: User;
  incomes: ApiTransaction[];
  expenses: ApiTransaction[];
  totals: { income: ApiMoneyValue; expense: ApiMoneyValue; balance: ApiMoneyValue };
};

type TransactionFormErrors = {
  type?: string;
  title?: string;
  amount?: string;
  category?: string;
};

const MAX_AMOUNT_CENTS = 99_999_999_999_999n;

function toCents(amount: string): bigint {
  const [whole, fraction = ""] = amount.replace(/^-/, "").split(".");
  const cents = BigInt(whole || "0") * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2));
  return amount.startsWith("-") ? -cents : cents;
}

function isValidAmount(amount: string): boolean {
  return /^\d+(?:\.\d{1,2})?$/.test(amount) && toCents(amount) > 0n && toCents(amount) <= MAX_AMOUNT_CENTS;
}

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
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const targetBalance = normalizeApiMoney("10000.00");
  const balanceProgress = balanceProgressPercent(
    totals?.balance ?? normalizeApiMoney("0"),
    targetBalance,
  );

  const validateTransactionForm = () => {
    const errors: TransactionFormErrors = {};

    if (!type) {
      errors.type = "Choose income or expense.";
    }

    if (!title.trim()) {
      errors.title = "Title is required.";
    }

    if (!amount.trim()) {
      errors.amount = "Amount is required.";
    } else if (!isValidAmount(amount)) {
      errors.amount = "Enter an amount from 0.01 to 999999999999.99, with up to 2 decimal places.";
    }

    if (!category) {
      errors.category = "Category is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetTransactionForm = () => {
    setType("");
    setTitle("");
    setAmount("");
    setCategory("");
    setFormErrors({});
    setFormMessage("");
    setEditingTransaction(null);
  };

  const startEditingTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setType(transaction.type);
    setTitle(transaction.title);
    setAmount(transaction.amount.decimal);
    setCategory(transaction.category ?? "");
    setFormErrors({});
    setFormMessage("");
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

    const isEditing = Boolean(editingTransaction);

    try {
      setSubmittingTransaction(true);

      const result = await fetch(
        isEditing
          ? `${API_BASE_URL}/api/transactions/${editingTransaction?.id}`
          : `${API_BASE_URL}/api/transactions`,
        {
          method: isEditing ? "PUT" : "POST",
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
        },
      );

      let data: { message?: string } | null = null;
      try {
        const responseBody: unknown = await result.json();
        if (
          typeof responseBody === "object" &&
          responseBody !== null &&
          "message" in responseBody &&
          typeof responseBody.message === "string"
        ) {
          data = { message: responseBody.message };
        }
      } catch {
        // Keep the HTTP status handling useful when a proxy returns non-JSON.
      }

      if (!result.ok) {
        setFormMessageType("error");
        setFormMessage(
          data?.message ||
            `The server could not ${isEditing ? "update" : "add"} this transaction. Please try again or contact support.`,
        );
        return;
      }

      setType("");
      setTitle("");
      setAmount("");
      setCategory("");
      setFormErrors({});
      setEditingTransaction(null);
      setFormMessageType("success");
      setFormMessage(
        isEditing
          ? "Transaction updated successfully."
          : "Transaction added successfully.",
      );
      setRefreshKey((current) => current + 1);
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
          if (result.status === 401) {
            navigate("/login");
            return;
          }

          const data = (await result
            .json()
            .catch(() => null)) as { message?: string } | null;

          setError(data?.message || "Could not load dashboard data");
          return;
        }

        const data: ApiDashboardData = await result.json();

        setError("");
        setUser(data.user);
        setIncomes(data.incomes.map((transaction) => ({
          ...transaction,
          amount: normalizeApiMoney(transaction.amount),
        })));
        setExpenses(data.expenses.map((transaction) => ({
          ...transaction,
          amount: normalizeApiMoney(transaction.amount),
        })));
        setTotals({
          income: normalizeApiMoney(data.totals.income),
          expense: normalizeApiMoney(data.totals.expense),
          balance: normalizeApiMoney(data.totals.balance),
        });
      } catch {
        setError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, [navigate, refreshKey]);

  const formatAmount = (amount: MoneyValue) => formatMoney(amount);

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
          <strong>{formatAmount(totals?.income ?? normalizeApiMoney("0"))}</strong>
        </article>

        <article className="metric-card metric-card-expense">
          <span>Total Expenses</span>
          <strong>{formatAmount(totals?.expense ?? normalizeApiMoney("0"))}</strong>
        </article>

        <article className="metric-card metric-card-balance">
          <span>Current Balance</span>
          <strong>{formatAmount(totals?.balance ?? normalizeApiMoney("0"))}</strong>
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

      <section className="panel transaction-panel">
        <div className="panel-header">
          <h2>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h2>
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
              type="text"
              name="amount"
              inputMode="decimal"
              value={amount}
              autoComplete="off"
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

          <div className="transaction-form-actions">
            <button type="submit" disabled={submittingTransaction}>
              {submittingTransaction
                ? editingTransaction
                  ? "Updating..."
                  : "Submitting..."
                : editingTransaction
                  ? "Update"
                  : "Submit"}
            </button>

            {editingTransaction && (
              <button
                className="button-secondary"
                type="button"
                onClick={resetTransactionForm}
                disabled={submittingTransaction}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
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
            <>
              <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id}>
                      <td>{income.title}</td>
                      <td>{income.category ?? "Uncategorized"}</td>
                      <td>{formatAmount(income.amount)}</td>
                      <td>{formatTransactionDate(income.transaction_date)}</td>
                      <td className="transaction-actions">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => startEditingTransaction(income)}
                        >
                          EDIT
                        </button>
                        <DeleteBtn
                          transactionId={income.id}
                          onDeleted={() =>
                            setRefreshKey((current) => current + 1)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="transaction-card-list">
                {incomes.map((income) => <article className="transaction-card" key={income.id}>
                  <div className="transaction-card-heading"><strong>{income.title}</strong><strong>{formatAmount(income.amount)}</strong></div>
                  <dl><div><dt>Category</dt><dd>{income.category ?? "Uncategorized"}</dd></div><div><dt>Date</dt><dd>{formatTransactionDate(income.transaction_date)}</dd></div></dl>
                  <div className="transaction-card-actions"><button type="button" className="button-secondary" onClick={() => startEditingTransaction(income)}>Edit</button><DeleteBtn transactionId={income.id} onDeleted={() => setRefreshKey((current) => current + 1)} /></div>
                </article>)}
              </div>
            </>
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
            <>
              <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td>{expense.category ?? "Uncategorized"}</td>
                      <td>{formatAmount(expense.amount)}</td>
                      <td>{formatTransactionDate(expense.transaction_date)}</td>
                      <td className="transaction-actions">
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => startEditingTransaction(expense)}
                        >
                          EDIT
                        </button>
                        <DeleteBtn
                          transactionId={expense.id}
                          onDeleted={() =>
                            setRefreshKey((current) => current + 1)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="transaction-card-list">
                {expenses.map((expense) => <article className="transaction-card" key={expense.id}>
                  <div className="transaction-card-heading"><strong>{expense.title}</strong><strong>{formatAmount(expense.amount)}</strong></div>
                  <dl><div><dt>Category</dt><dd>{expense.category ?? "Uncategorized"}</dd></div><div><dt>Date</dt><dd>{formatTransactionDate(expense.transaction_date)}</dd></div></dl>
                  <div className="transaction-card-actions"><button type="button" className="button-secondary" onClick={() => startEditingTransaction(expense)}>Edit</button><DeleteBtn transactionId={expense.id} onDeleted={() => setRefreshKey((current) => current + 1)} /></div>
                </article>)}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
