import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex" style={{ backgroundColor: "#FAF7F5" }}>
      {/* Left side — branding */}
      <div
        className="hidden md:flex flex-col justify-center px-16"
        style={{
          width: "45%",
          background: "linear-gradient(135deg, #C17B7B 0%, #D4978A 100%)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "2.8rem",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          CycleWell
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "1rem",
            lineHeight: 1.7,
          }}
        >
          Your personal PCOS companion — track, understand, and take control of
          your health.
        </p>
        <div className="flex flex-col gap-4 mt-12">
          {[
            "Period & cycle tracking",
            "Mood & stress journal",
            "Medicine reminders",
            "Hormone log",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
              />
              <p
                style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}
              >
                {f}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — sign up form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-8 text-center md:hidden">
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "2rem",
              color: "#C17B7B",
              fontWeight: 700,
            }}
          >
            CycleWell
          </h1>
          <p style={{ color: "#B09A95", fontSize: "0.9rem", marginTop: "4px" }}>
            Your PCOS companion
          </p>
        </div>
        <div className="mb-6 text-center hidden md:block">
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "1.8rem",
              color: "#2C1810",
              fontWeight: 600,
            }}
          >
            Create your account
          </h2>
          <p style={{ color: "#B09A95", fontSize: "0.9rem", marginTop: "4px" }}>
            Start your wellness journey today
          </p>
        </div>
        <SignUp />
      </div>
    </main>
  );
}
