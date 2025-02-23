"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";

export default function StatsPage() {
  const { theme } = useTheme();
  const encounterId = Cookies.get("encounter_id");
  const resultRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    co2: "",
    chloride: "",
    weight: "",
    sodium: "",
    creatinine: "",
    bmi: "",
    calcium: "",
    potassium: "",
    tobacco_status: "",
    height: "",
    bp_diastolic: "",
    bp_systolic: "",
    heart_rate: "",
    respiratory_rate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<{
    diagnosis: string;
    message: string;
    probability: string;
  } | null>(null);

  useEffect(() => {
    if (diagnosisResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [diagnosisResult]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDiagnosisResult(null);

    try {
      const token = Cookies.get("access_token");
      const encounterId = Cookies.get("encounter_id");
      const authHeader = `Bearer ${token}`;

      const payload = {
        encounter_id: encounterId,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key, 
            value ? parseInt(value) : null
          ]))
        };

      await axios.post("http://127.0.0.1:8000/encounter/stats/", payload, {
        headers: { Authorization: authHeader }
      });
      
      const diagnosisPayload = { encounter_id: encounterId };
      const response = await axios.post(
        "http://127.0.0.1:8000/encounter/diagnosis/",
        diagnosisPayload,
        { headers: { Authorization: authHeader } }
      );
      
      setDiagnosisResult(response.data);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl p-8 shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <h1 className="text-3xl font-bold mb-8 text-center">Health Statistics</h1>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vital Signs */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Vital Signs</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Blood Pressure (mmHg)</label>
                <div className="flex gap-2">
                  <input
                    id="bp_systolic"
                    type="number"
                    placeholder="Systolic"
                    value={formData.bp_systolic}
                    onChange={handleChange}
                    className={`w-1/2 p-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    id="bp_diastolic"
                    type="number"
                    placeholder="Diastolic"
                    value={formData.bp_diastolic}
                    onChange={handleChange}
                    className={`w-1/2 p-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Heart Rate (bpm)</label>
                <input
                  id="heart_rate"
                  type="number"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Respiratory Rate (breaths/min)</label>
                <input
                  id="respiratory_rate"
                  type="number"
                  value={formData.respiratory_rate}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Blood Work */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Blood Work</h2>
              {[
                { id: "sodium", label: "Sodium (mmol/L)" },
                { id: "potassium", label: "Potassium (mmol/L)" },
                { id: "chloride", label: "Chloride (mmol/L)" },
                { id: "co2", label: "CO2 (mmol/L)" },
                { id: "calcium", label: "Calcium (mg/dL)" },
                { id: "creatinine", label: "Creatinine (mg/dL)" },
              ].map((field) => (
                <div className="space-y-2" key={field.id}>
                  <label className="block text-sm font-medium">{field.label}</label>
                  <input
                    id={field.id}
                    type="number"
                    step="0.01"
                    value={formData[field.id as keyof typeof formData]}
                    onChange={handleChange}
                    className={`w-full p-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Anthropometrics */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Anthropometrics</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Height (cm)</label>
                <input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">BMI</label>
                <input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Lifestyle</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Tobacco Status</label>
                <select
                  id="tobacco_status"
                  value={formData.tobacco_status}
                  onChange={(e) => setFormData({...formData, tobacco_status: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="-2">Non-smoker</option>
                  <option value="0">Former smoker</option>
                  <option value="2">Current smoker</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Health Statistics"
                )}
              </button>
            </div>
          </form>

          {/* Diagnosis Results */}
          {diagnosisResult && (
            <div 
              ref={resultRef}
              className={`mt-8 p-6 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">Diagnosis Results</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Diagnosis:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full ${
                    diagnosisResult.diagnosis === "Healthy" 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {diagnosisResult.diagnosis}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Probability:</span>
                  <span className="ml-2">
                    {(parseFloat(diagnosisResult.probability) * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="font-medium">Message:</span>
                  <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {diagnosisResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}