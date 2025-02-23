"use client";
import { useState } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function EncounterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [painSeverity, setPainSeverity] = useState<number>(5);
  const [reasonDesc, setReasonDesc] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = Cookies.get("access_token");
      const authHeader = `Bearer ${token}`;
      const res = await axios.get("http://127.0.0.1:8000/utils/decode_user/", {
        headers: { Authorization: authHeader }
      });
      const payload = {
        pain_severity: painSeverity,
        reason_desc: reasonDesc,
        start_date: new Date().toISOString(),
        email:res.data.email
      };

      const response = await axios.post("http://127.0.0.1:8000/encounter/create/", payload, {
        headers: { Authorization: authHeader }
      });
      Cookies.set("encounter_id", response.data.encounter_id);
      router.push("/Encounter/Stats");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-xl p-8 shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <h1 className="text-3xl font-bold mb-8 text-center">New Health Encounter</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pain Severity Slider */}
            <div className="space-y-6">
              <label className="block text-xl font-medium">
                Pain Severity: {painSeverity}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painSeverity}
                  onChange={(e) => setPainSeverity(Number(e.target.value))}
                  className={`w-full h-3 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-gray-700 range-dark' 
                      : 'bg-gray-200 range-light'
                  }`}
                  required
                />
                <div className="flex justify-between text-sm mt-2 px-1">
                  {[...Array(11)].map((_, i) => (
                    <span 
                      key={i}
                      className={`w-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reason Description */}
            <div className="space-y-4">
              <label className="block text-xl font-medium">
                Reason for Encounter
              </label>
              <textarea
                value={reasonDesc}
                onChange={(e) => setReasonDesc(e.target.value)}
                className={`w-full p-4 rounded-lg border min-h-[150px] ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Describe your symptoms and reasons for this encounter..."
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                "Create Health Encounter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}