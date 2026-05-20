"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const steps = [
  "Personal Details",
  "PCOS Background",
  "Lifestyle",
  "Current Health",
];

const inputClass =
  "w-full border border-[#F4C2CE] rounded-xl px-4 py-3 text-[#2D1B20] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8537A] focus:border-transparent text-sm";
const labelClass = "text-sm font-medium text-[#7A4F57] mb-1 block";
const chipActive =
  "px-4 py-2 rounded-full text-sm font-medium border bg-[#FDE8EF] border-[#E8537A] text-[#C0392B] cursor-pointer";
const chipInactive =
  "px-4 py-2 rounded-full text-sm font-medium border bg-white border-[#F4C2CE] text-[#7A4F57] cursor-pointer";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    diagnosedPCOS: "",
    cycleLength: "",
    periodLength: "",
    primaryGoal: "",
    activityLevel: "",
    dietaryPref: "",
    medications: "",
    allergies: [] as string[],
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAllergy = (allergy: string) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clerkId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
        }),
      });
      if (res.ok) router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center px-4 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-[#E8537A] mb-1">CycleWell</h1>
      <p className="text-[#7A4F57] mb-8">Let's get to know you</p>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i <= step
                  ? "bg-[#E8537A] text-white"
                  : "bg-[#FDE8EF] text-[#E8537A]"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-xs text-[#B08090] hidden sm:block">{s}</span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDE8EF] p-8 w-full max-w-md">
        {/* Step 1 */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[#2D1B20]">
              Personal Details
            </h2>
            <input
              className={inputClass}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <div>
              <label className={labelClass}>Date of birth</label>
              <input
                type="date"
                className={inputClass}
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
            </div>
            <input
              className={inputClass}
              placeholder="Height (cm)"
              type="number"
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={(e) => update("weight", e.target.value)}
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[#2D1B20]">
              PCOS Background
            </h2>
            <div>
              <label className={labelClass}>
                Have you been diagnosed with PCOS/PCOD?
              </label>
              <div className="flex gap-3 mt-2">
                {["Yes", "No", "Not sure"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("diagnosedPCOS", opt)}
                    className={
                      form.diagnosedPCOS === opt ? chipActive : chipInactive
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Average cycle length</label>
              <select
                className={inputClass}
                value={form.cycleLength}
                onChange={(e) => update("cycleLength", e.target.value)}
              >
                <option value="">Select...</option>
                <option>Less than 21 days</option>
                <option>21–35 days</option>
                <option>35–45 days</option>
                <option>Irregular</option>
                <option>Not sure</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Average period duration</label>
              <select
                className={inputClass}
                value={form.periodLength}
                onChange={(e) => update("periodLength", e.target.value)}
              >
                <option value="">Select...</option>
                <option>1–3 days</option>
                <option>4–6 days</option>
                <option>7+ days</option>
                <option>Not sure</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[#2D1B20]">Lifestyle</h2>
            <div>
              <label className={labelClass}>Primary goal</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "Manage symptoms",
                  "Track my cycle",
                  "Improve diet",
                  "Support fertility",
                  "General wellness",
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("primaryGoal", opt)}
                    className={
                      form.primaryGoal === opt ? chipActive : chipInactive
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Activity level</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "Sedentary",
                  "Lightly active",
                  "Moderately active",
                  "Very active",
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => update("activityLevel", opt)}
                    className={
                      form.activityLevel === opt ? chipActive : chipInactive
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Dietary preference</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Vegetarian", "Vegan", "Non-vegetarian", "No preference"].map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => update("dietaryPref", opt)}
                      className={
                        form.dietaryPref === opt ? chipActive : chipInactive
                      }
                    >
                      {opt}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-[#2D1B20]">
              Current Health
            </h2>
            <div>
              <label className={labelClass}>
                Current medications (optional)
              </label>
              <textarea
                className={`${inputClass} resize-none h-24`}
                placeholder="e.g. Metformin, Inositol..."
                value={form.medications}
                onChange={(e) => update("medications", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>
                Any allergies or intolerances?
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Gluten", "Dairy", "Nuts", "Soy", "None"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleAllergy(opt)}
                    className={
                      form.allergies.includes(opt) ? chipActive : chipInactive
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-[#E8537A] font-medium"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#E8537A] text-white px-6 py-2 rounded-full font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#E8537A] text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Get started →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
