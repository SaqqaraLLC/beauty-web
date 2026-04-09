export default function PendingApprovalPage() {
  return (
    <main style={{ padding: 40, maxWidth: 480 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Application Pending ⏳
      </h1>

      <p style={{ marginBottom: 20 }}>
        Thank you for applying to Saqqara.
      </p>

      <p style={{ marginBottom: 20 }}>
        Your application is currently under review by our team.
        You will receive access once it has been approved.
      </p>

      <p style={{ color: "#555" }}>
        This process may take up to 24–48 hours.
      </p>
    </main>
  );
}