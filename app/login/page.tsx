export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const field = { width: "100%", height: 32, padding: "0 8px", boxSizing: "border-box" as const, border: "1px solid #d8dee6", borderRadius: 3, font: "inherit" };
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f8", color: "#1f2933" }}>
      <form method="post" action="/api/login" data-testid="login-form" style={{ width: 340, background: "#fff", border: "1px solid #d8dee6", borderRadius: 4, padding: 22 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 18 }}>Sign in to Ledgerline</h1>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7a89" }}>Van Dijk &amp; Zonen B.V.</p>
        {error && <div data-testid="login-error" role="alert" style={{ marginBottom: 12, padding: "7px 9px", background: "#fdeceb", border: "1px solid #f0cdc9", borderRadius: 3, fontSize: 12, color: "#a32b25" }}>That email and password do not match. Passwords are case sensitive, so check capital letters. If you cannot sign in, ask your administrator for a new password.</div>}
        <label style={{ display: "block", marginBottom: 12, fontSize: 12 }}>Email
          <input data-testid="login-email" name="email" type="email" autoComplete="username" required style={field} />
        </label>
        <label style={{ display: "block", marginBottom: 16, fontSize: 12 }}>Password
          <input data-testid="login-password" name="password" type="password" autoComplete="current-password" required style={field} />
        </label>
        <button data-testid="login-submit" type="submit" style={{ width: "100%", height: 34, background: "#1a6091", border: "1px solid #1a6091", borderRadius: 3, color: "#fff", font: "inherit", fontWeight: 600, cursor: "pointer" }}>Sign in</button>
      </form>
    </main>
  );
}
