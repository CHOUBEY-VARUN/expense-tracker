import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-content">
          <p className="eyebrow">Personal Finance</p>
          <h1 id="home-title">Expense Tracker</h1>
          <p className="home-subtitle">
            A cleaner way to see your income, spending, and balance in one calm
            dashboard.
          </p>

          <div className="home-actions" aria-label="Account actions">
            <Link className="home-button home-button-primary" to="/login">
              Login
            </Link>

            <Link className="home-button home-button-secondary" to="/register">
              Register
            </Link>
          </div>
        </div>

        <div className="home-preview" aria-hidden="true">
          <div className="preview-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="preview-balance">
            <span>Balance</span>
            <strong>Rs 24,680</strong>
          </div>

          <div className="preview-chart">
            <span className="bar bar-one"></span>
            <span className="bar bar-two"></span>
            <span className="bar bar-three"></span>
            <span className="bar bar-four"></span>
            <span className="bar bar-five"></span>
          </div>

          <div className="preview-list">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="home-highlights" aria-label="Finance highlights">
        <article className="highlight-card highlight-income">
          <span>Income</span>
          <strong>Organized</strong>
        </article>

        <article className="highlight-card highlight-expense">
          <span>Expenses</span>
          <strong>Visible</strong>
        </article>

        <article className="highlight-card highlight-balance">
          <span>Balance</span>
          <strong>Focused</strong>
        </article>
      </section>
    </main>
  );
}

export default Home;
