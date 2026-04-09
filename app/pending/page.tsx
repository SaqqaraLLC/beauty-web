export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md card text-center">
        <div className="text-3xl mb-4">⏳</div>
        <h1 className="text-xl font-cinzel mb-3">Application Pending</h1>
        <p className="text-saqqara-light/60 text-sm mb-3">
          Thank you for applying to Saqqara. Your application is currently under review by our team.
        </p>
        <p className="text-saqqara-light/60 text-sm mb-3">
          You will receive access once it has been approved.
        </p>
        <p className="text-saqqara-light/40 text-xs">
          This process may take up to 24–48 hours.
        </p>
      </div>
    </div>
  );
}
