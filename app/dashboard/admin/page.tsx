"use client";

import { useEffect, useState } from "react";

type PendingUser = {
  id: string;
  email: string;
  status: string;
  role?: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const load = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/pending-users`,
      { credentials: "include" }
    );

    // Auth states (already fixed server-side)
    if (res.status === 401) {
      setError("Please log in");
      return;
    }

    if (res.status === 403) {
      setError("You are not authorized");
      return;
    }

    if (!res.ok) {
      setError(`Server error ${res.status}`);
      return;
    }

    // ✅ Backend returns ARRAY
    const data = await res.json();

    // ✅ Validate shape
    if (!Array.isArray(data)) {
      setError("Unexpected response format");
      return;
    }

    setUsers(data);
  };

  load();
}, []);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
      <h1>Pending Users</h1>

      {users.length === 0 && <p>No pending users.</p>}

      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.email} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
