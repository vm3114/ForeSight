"use client";
import Link from "next/link";
import { Activity, Download, HeartPulse, History, File } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-16 text-center tracking-wide drop-shadow-lg">
          ForeSight Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/** Preventive Care Card **/}
          <Link href="/PreventiveCare">
            <div className={`relative p-16 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105 ${isDarkMode ? "bg-gradient-to-r from-green-500 to-teal-400" : "bg-gradient-to-r from-green-200 to-teal-100"}`}>
              <HeartPulse className="h-16 w-16 text-white drop-shadow-xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white text-center">Preventive Care</h3>
              <p className="text-white text-center">Access personalized prevention plans and health screenings</p>
            </div>
          </Link>

          {/** Medical History Card **/}
          <Link href="/MedicalHistory">
            <div className={`relative p-16 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105 ${isDarkMode ? "bg-gradient-to-r from-blue-500 to-indigo-400" : "bg-gradient-to-r from-blue-200 to-indigo-100"}`}>
              <History className="h-16 w-16 text-white drop-shadow-xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white text-center">Medical History</h3>
              <p className="text-white text-center">View and manage your complete medical records</p>
            </div>
          </Link>

          {/** Detailed Checkup Card **/}
          <Link href="/Encounter">
            <div className={`relative p-16 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105 ${isDarkMode ? "bg-gradient-to-r from-purple-500 to-pink-400" : "bg-gradient-to-r from-purple-200 to-pink-100"}`}>
              <Activity className="h-16 w-16 text-white drop-shadow-xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white text-center">Detailed Checkups</h3>
              <p className="text-white text-center">Schedule comprehensive health assessments and tests</p>
            </div>
          </Link>

          {/** Download Data Card **/}
          <Link href="/PatientData">
            <div className={`relative p-2 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105 ${isDarkMode ? "bg-gradient-to-r from-cyan-500 to-blue-400" : "bg-gradient-to-r from-cyan-200 to-blue-100"}`}>
                <div className={`relative p-14 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105 ${isDarkMode ? "bg-gradient-to-r from-cyan-500 to-blue-400" : "bg-gradient-to-r from-cyan-200 to-blue-100"}`}>
              <File className="h-16 w-16 text-white drop-shadow-xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-white text-center">Patient Data</h3>
              <p className="text-white text-center">Explore comprehensive patient data insights for informed medical decisions.
              </p>
            </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg font-light tracking-wide">
            HL7 FHIR® Compatible Health Records
          </p>
        </div>
      </div>
    </div>
  );
}
