"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RocketIcon, HeartPulseIcon, BrainIcon, Biohazard } from "lucide-react";

export default function ForeSightLanding() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 px-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-40 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-3xl animate-pulse delay-1500" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-6xl w-full text-center backdrop-blur-lg rounded-3xl bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
        <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight mb-8 animate-fade-in">
          ForeSight
        </h1>

        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
          ML-Powered Predictive Health Monitoring System – Revolutionizing early risk detection 
          and proactive care through real-time biometric analysis and AI-driven insights.
        </p>

        {/* Feature icons */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {[
            { icon: RocketIcon, text: "Real-time Analytics" },
            { icon: Biohazard, text: "Disease Prevention" },
            { icon: BrainIcon, text: "AI Predictions" },
          ].map((item, index) => (
            <div key={index} className="space-y-4 animate-float">
              <item.icon className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
          <Button 
            onClick={() => router.push("/SignUp")}
            className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-2xl space-x-2"
          >
            <span>Get Started</span>
            <RocketIcon className="h-5 w-5 group-hover:animate-launch" />
          </Button>

          <Button 
            onClick={() => router.push("/signin")}
            variant="outline"
            className="px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 border-2 border-blue-600/50 dark:border-blue-400/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-600 dark:hover:border-blue-400 transform hover:scale-105 hover:shadow-xl"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
}