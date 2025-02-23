"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { FaUser, FaNotesMedical, FaHeartbeat, FaChartPie } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// TypeScript interfaces for our data
interface MedicalHistory {
  allergies: string[];
  current_medications: string[];
  family_medical_history: string[];
  past_medical_diagnoses: string[];
  patient_id: string;
}

interface Symptoms {
  age: number;
  alcohol_consumption: number;
  bp_diastolic: number;
  bp_systolic: number;
  cholesterol: number;
  difficulty_walking: number;
  does_smoke: number;
  gender: string | null;
  general_health: number;
  glucose: number;
  height: number;
  patient_id: string;
  physical_activity: number;
  recent_stroke: number;
  weight: number;
}

interface User {
  Age: number;
  City: string;
  Country: string;
  Email: string;
  Ethnicity: string;
  Fullname: string;
  Gender: string;
  Password: string;
  patient_id: string;
}

interface PatientData {
  user: User;
  symptoms: Symptoms;
  medical_history: MedicalHistory;
}

const PatientDataDashboard: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) {
          console.error("No access token found.");
          return;
        }
        const authHeader = `Bearer ${token}`;

        // First API call to decode user and get email
        const response = await axios.get("http://127.0.0.1:8000/utils/decode_user/", {
          headers: { Authorization: authHeader },
        });
        const email: string = response.data.email;

        // Second API call to fetch complete user data
        const res = await axios.get(
          `http://127.0.0.1:8000/user/get_all_user_data/${email}/`,
          { headers: { Authorization: authHeader } }
        );
        setPatientData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="mt-4 text-white text-xl">Loading Patient Data...</p>
        </div>
      </div>
    );
  }

  const { medical_history, symptoms, user } = patientData;

  // Calculate BMI
  const heightInMeters = symptoms.height / 100;
  const bmiValue = symptoms.weight / (heightInMeters * heightInMeters);
  const bmi = parseFloat(bmiValue.toFixed(1));

  // Determine BMI status and color
  let bmiColor = "text-green-500"; // Normal
  let bmiStatus = "Normal";
  if (bmi >= 25) {
    bmiColor = "text-red-500"; // Overweight
    bmiStatus = "High (Overweight)";
  } else if (bmi < 18.5) {
    bmiColor = "text-blue-500"; // Underweight
    bmiStatus = "Low (Underweight)";
  }

  // Blood Pressure data (Bar Chart)
  const bpData = {
    labels: ["Systolic", "Diastolic"],
    datasets: [
      {
        label: "Blood Pressure (mm Hg)",
        data: [symptoms.bp_systolic, symptoms.bp_diastolic],
        backgroundColor: ["#4FD1C5", "#63B3ED"],
      },
    ],
  };

  // Risk factors data (Pie Chart)
  const riskData = {
    labels: ["Cholesterol", "Glucose", "BMI"],
    datasets: [
      {
        label: "Risk Factors",
        data: [symptoms.cholesterol, symptoms.glucose, bmi],
        backgroundColor: ["#F56565", "#ED8936", "#ECC94B"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">
          Patient Data Dashboard
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
          A comprehensive view of your health metrics
        </p>
      </header>

      {/* User & Medical History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-center mb-4">
            <FaUser className="text-2xl text-blue-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Information</h2>
          </div>
          <p>
            <span className="font-semibold">Name:</span> {user.Fullname}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.Email}
          </p>
          <p>
            <span className="font-semibold">City:</span> {user.City}
          </p>
          <p>
            <span className="font-semibold">Country:</span> {user.Country}
          </p>
          <p>
            <span className="font-semibold">Ethnicity:</span> {user.Ethnicity}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-center mb-4">
            <FaNotesMedical className="text-2xl text-green-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Medical History</h2>
          </div>
          <p>
            <span className="font-semibold">Past Diagnoses:</span>{" "}
            {medical_history.past_medical_diagnoses.join(", ")}
          </p>
          <p>
            <span className="font-semibold">Allergies:</span>{" "}
            {medical_history.allergies.join(", ")}
          </p>
          <p>
            <span className="font-semibold">Family History:</span>{" "}
            {medical_history.family_medical_history.join(", ")}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-center mb-4">
            <FaHeartbeat className="text-2xl text-red-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Blood Pressure</h2>
          </div>
          <Bar data={bpData} />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-center mb-4">
            <FaChartPie className="text-2xl text-yellow-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Risk Factors</h2>
          </div>
          <Pie data={riskData} />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transform hover:scale-105 transition duration-300">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Additional Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>
            <span className="font-semibold">Age:</span> {symptoms.age}
          </p>
          <p>
            <span className="font-semibold">Height:</span> {symptoms.height} cm
          </p>
          <p>
            <span className="font-semibold">Weight:</span> {symptoms.weight} kg
          </p>
          <p className={bmiColor}>
            <span className="font-semibold">BMI:</span> {bmi} - {bmiStatus}
          </p>
          <p>
            <span className="font-semibold">Glucose Level:</span> {symptoms.glucose} mg/dL
          </p>
          <p>
            <span className="font-semibold">Cholesterol Level:</span> {symptoms.cholesterol} mg/dL
          </p>
          <p>
            <span className="font-semibold">General Health Rating:</span> {symptoms.general_health} / 5
          </p>
          <p>
            <span className="font-semibold">Physical Activity:</span>{" "}
            {symptoms.physical_activity ? "Active" : "Inactive"}
          </p>
          <p>
            <span className="font-semibold">Smoking Status:</span>{" "}
            {symptoms.does_smoke ? "Smoker" : "Non-Smoker"}
          </p>
          <p>
            <span className="font-semibold">Alcohol Consumption:</span> {symptoms.alcohol_consumption}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDataDashboard;
