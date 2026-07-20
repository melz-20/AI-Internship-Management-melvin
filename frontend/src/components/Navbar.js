function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "2px solid var(--primary-light)",
      }}
    >
      <div className="container">

        <a
          className="navbar-brand fw-bold"
          href="/"
          style={{
            color: "var(--primary)",
            fontSize: "1.5rem",
          }}
        >
          Assessment Portal
        </a>

        <div className="navbar-nav ms-auto">

          <a
            className="nav-link fw-semibold"
            href="/"
            style={{ color: "var(--text)" }}
          >
            Dashboard
          </a>

          <a
            className="nav-link fw-semibold"
            href="/"
            style={{ color: "var(--text)" }}
          >
            Assessments
          </a>

          <a
            className="nav-link fw-semibold"
            href="/"
            style={{ color: "var(--text)" }}
          >
            Results
          </a>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;