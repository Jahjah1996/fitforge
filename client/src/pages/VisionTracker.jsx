import { useState } from "react";
import Camera from "../components/Camera";

export default function VisionTracker() {
  const [exercise, setExercise] = useState("squat");

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">AI Form Tracker</h1>
        <p className="text-xl text-gray-500">Practice your form with real-time AI feedback.</p>
      </div>

      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
          <button 
            onClick={() => setExercise("squat")} 
            className={`px-8 py-3 rounded-lg font-bold transition-all ${exercise === "squat" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Squats
          </button>
          <button 
            onClick={() => setExercise("pushup")} 
            className={`px-8 py-3 rounded-lg font-bold transition-all ${exercise === "pushup" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Push-ups
          </button>
        </div>
      </div>

      <Camera exercise={exercise} />
    </div>
  );
}
