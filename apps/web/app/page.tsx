import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FAF7F5" }}
    >
      {/* Nav */}
      <nav
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EDE0D8",
        }}
        className="px-8 py-5 flex justify-between items-center"
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#C17B7B",
            fontSize: "1.4rem",
            fontWeight: 600,
          }}
        >
          CycleWell
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            style={{
              color: "#8C6B63",
              fontSize: "0.9rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            style={{
              backgroundColor: "#C17B7B",
              color: "#FFFFFF",
              padding: "10px 22px",
              borderRadius: "100px",
              fontSize: "0.88rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#C17B7B",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            backgroundColor: "#F5EAE8",
            padding: "6px 16px",
            borderRadius: "100px",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          Your PCOS companion
        </span>

        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "3.5rem",
            fontWeight: 700,
            color: "#2C1810",
            lineHeight: 1.2,
            maxWidth: "600px",
            marginBottom: "20px",
          }}
        >
          Understand your body, one day at a time
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "#8C6B63",
            lineHeight: 1.8,
            maxWidth: "480px",
            marginBottom: "40px",
          }}
        >
          CycleWell helps you track your cycle, symptoms, mood, diet, exercise,
          and hormones — all in one calm, supportive space.
        </p>

        <div className="flex gap-4 items-center">
          <Link
            href="/sign-up"
            style={{
              backgroundColor: "#C17B7B",
              color: "#FFFFFF",
              padding: "14px 32px",
              borderRadius: "100px",
              fontSize: "0.95rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Start for free →
          </Link>
          <Link
            href="/sign-in"
            style={{
              color: "#8C6B63",
              fontSize: "0.9rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Already have an account?
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-2xl w-full">
          {[
            { emoji: "🩸", label: "Period Tracker" },
            { emoji: "🌸", label: "Mood Journal" },
            { emoji: "💊", label: "Medicine Log" },
            { emoji: "🔬", label: "Hormone Tracker" },
            { emoji: "📋", label: "Symptom Log" },
            { emoji: "🏃", label: "Exercise Tracker" },
            { emoji: "🥗", label: "Diet Tracker" },
            { emoji: "✨", label: "Daily Tips" },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #EDE0D8",
                borderRadius: "16px",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{f.emoji}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#8C6B63",
                  fontWeight: 500,
                }}
              >
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid #EDE0D8", padding: "20px 32px" }}
        className="flex justify-between items-center"
      >
        <p style={{ fontSize: "0.82rem", color: "#B09A95" }}>
          © 2026 CycleWell
        </p>
        <p style={{ fontSize: "0.82rem", color: "#B09A95" }}>
          Made with 🌸 for PCOS warriors
        </p>
      </footer>
    </main>
  );
}
