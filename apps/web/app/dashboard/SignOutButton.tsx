"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
      style={{
        fontSize: "0.78rem",
        color: "#B09A95",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      Sign out
    </button>
  );
}
