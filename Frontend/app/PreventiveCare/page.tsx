"use client";
import { useState, useEffect, useRef} from "react";
import axios from  "axios";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";

interface FormData {
  alcohol_consumption: string;
  bp_diastolic: string;
  bp_systolic: string;
  cholesterol: string;
  difficulty_walking: string;
  does_smoke: string;
  general_health: string;
  glucose: string;
  height: string;
  physical_activity: string;
  recent_stroke: string;
  weight: string;
}

export default function HealthQuestionnaire() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    alcohol_consumption: "0", // Default to No
    bp_diastolic: "",
    bp_systolic: "",
    cholesterol: "",
    difficulty_walking: "0",
    does_smoke: "0",
    general_health: "1", // Default to 1
    glucose: "",
    height: "",
    physical_activity: "0",
    recent_stroke: "0",
    weight: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = Cookies.get("access_token");
      const authHeader = `Bearer ${token}`;
      
      // Get user email
      const userResponse = await axios.get(
        "http://127.0.0.1:8000/utils/decode_user/",
        { headers: { Authorization: authHeader } }
      );

      // Convert all fields to numbers
      const payload = {
        alcohol_consumption: parseInt(formData.alcohol_consumption, 10),
        bp_diastolic: parseInt(formData.bp_diastolic, 10),
        bp_systolic: parseInt(formData.bp_systolic, 10),
        cholesterol: parseInt(formData.cholesterol, 10),
        difficulty_walking: parseInt(formData.difficulty_walking, 10),
        does_smoke: parseInt(formData.does_smoke, 10),
        general_health: parseInt(formData.general_health, 10),
        glucose: parseInt(formData.glucose, 10),
        height: parseInt(formData.height, 10),
        physical_activity: parseInt(formData.physical_activity, 10),
        recent_stroke: parseInt(formData.recent_stroke, 10),
        weight: parseInt(formData.weight, 10),
        email: userResponse.data.email,
      };
      console.log(payload)

    await axios.post("http://127.0.0.1:8000/user/create_symptoms/", payload, {
        headers: { Authorization: authHeader }
      });
      const chicken = {email: userResponse.data.email}
      console.log(chicken)
      const out = await axios.post("http://127.0.0.1:8000/user/prevention/", chicken,{
        headers: { Authorization: authHeader }
      })
      setOutput(out.data.result);
      console.log(output)
    } catch (error) {
      console.error("Submission error:", error);  
    } finally {
      setIsSubmitting(false);
    }
  };

  const OutputDisplay = ({ data, theme }: { data: any; theme: string | undefined }) => {

    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (data && Object.keys(data).length > 0 && outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, [data]);

    if (!data || Object.keys(data).length === 0) return null;
    return (
      <div className={`mt-12 p-6 rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Health Recommendations</h2>
        
        <div className="space-y-6">
          {Object.entries(data).map(([key, value]) => (
            <div 
              key={key}
              className={`p-4 rounded-lg transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-white hover:bg-gray-50 shadow-sm'
              }`}
            >
              <h3 className="font-semibold text-lg mb-2 capitalize text-emerald-500">
                {key.replace(/_/g, ' ')}
              </h3>
              {typeof value === 'string' ? (
                <p className={`whitespace-pre-wrap ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {value}
                </p>
              ) : (
                <pre className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
  
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            New Assessment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl p-8 shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <h1 className="text-3xl font-bold mb-8 text-center">Health Assessment</h1>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alcohol Consumption */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Alcohol Consumption</label>
              <select
                id="alcohol_consumption"
                value={formData.alcohol_consumption}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Blood Pressure (mmHg)</label>
              <div className="flex gap-4">
                <input
                  id="bp_systolic"
                  type="number"
                  placeholder="Systolic"
                  value={formData.bp_systolic}
                  onChange={handleChange}
                  className={`w-1/2 p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                  min="50"
                  max="250"
                />
                <input
                  id="bp_diastolic"
                  type="number"
                  placeholder="Diastolic"
                  value={formData.bp_diastolic}
                  onChange={handleChange}
                  className={`w-1/2 p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                  min="30"
                  max="150"
                />
              </div>
            </div>

            {/* Cholesterol */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cholesterol (mg/dL)</label>
              <input
                id="cholesterol"
                type="number"
                value={formData.cholesterol}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
                min="100"
                max="400"
              />
            </div>

            {/* Smoking */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Do you smoke?</label>
              <select
                id="does_smoke"
                value={formData.does_smoke}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            {/* Height and Weight */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Height (cm)</label>
              <input
                id="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
                min="100"
                max="250"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
                min="30"
                max="300"
              />
            </div>

            {/* Boolean Fields */}
            {[
              { field: 'difficulty_walking', label: 'Difficulty Walking' },
              { field: 'physical_activity', label: 'Physical Activity' },
              { field: 'recent_stroke', label: 'Recent Stroke' }
            ].map(({ field, label }) => (
              <div className="space-y-2" key={field}>
                <label className="block text-sm font-medium">{label}</label>
                <select
                  id={field}
                  value={formData[field as keyof FormData]}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            ))}

            {/* General Health Scale */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">General Health (1-5)</label>
              <select
                id="general_health"
                value={formData.general_health}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} - {num === 5 ? 'Excellent' : 
                            num === 4 ? 'Very Good' :
                            num === 3 ? 'Good' : 
                            num === 2 ? 'Fair' : 
                            'Poor'}
                  </option>
                ))}
              </select>
            </div>

            {/* Glucose */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Glucose (mg/dL)</label>
              <input
                id="glucose"
                type="number"
                value={formData.glucose}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
                required
                min="50"
                max="500"
              />
            </div>

            <div className="md:col-span-2 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Health Assessment"
                )}
              </button> 
            </div>
          </form>
          <OutputDisplay data={output} theme={theme} />
        </div>
      </div>
    </div>
  );
}