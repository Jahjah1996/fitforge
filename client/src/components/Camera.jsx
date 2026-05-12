import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { usePoseDetection } from "../hooks/usePoseDetection";
import { useRepCounter } from "../hooks/useRepCounter";

export default function Camera({ exercise = "squat" }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);

  const { reps, stage, formWarning, processKeypoints } = useRepCounter(exercise);

  const { isReady, error } = usePoseDetection(
    active,
    webcamRef,
    canvasRef,
    processKeypoints
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Form Tracker</h2>
        <div className="bg-[#FEF2F2] text-[#EF4444] px-3 py-1 rounded-full font-bold uppercase text-sm">
          Tracking: {exercise}
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-6 text-center">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-bold mb-2">Camera Inactive</h3>
            <p className="text-gray-400 max-w-md">Allow camera access and start tracking to count your {exercise} reps automatically.</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-20 p-6 text-center">
            <p className="text-red-400 font-bold text-lg">AI Model Error: {error}</p>
          </div>
        )}

        {active && !isReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            <p className="animate-pulse font-bold text-lg">Loading AI Model...</p>
          </div>
        )}

        {active && (
          <>
            <Webcam
              ref={webcamRef}
              mirrored
              className="absolute inset-0 w-full h-full object-cover"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <div className="bg-[#EF4444] text-white rounded-xl p-5 text-center flex-1 shadow-md">
          <p className="text-5xl font-extrabold mb-1">{reps}</p>
          <p className="text-sm font-medium uppercase tracking-wider opacity-80">Reps Counted</p>
        </div>
        <div className="bg-gray-100 text-gray-800 rounded-xl p-5 text-center flex-1 border border-gray-200">
          <p className="text-3xl font-extrabold mb-3 capitalize text-gray-900">{stage}</p>
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">Current Stage</p>
        </div>
      </div>

      {formWarning && active && (
        <div className="mt-4 bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold">{formWarning}</p>
        </div>
      )}

      <button
        onClick={() => setActive(!active)}
        className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
          active 
            ? "bg-white text-[#EF4444] border border-[#EF4444] hover:bg-[#FEF2F2]" 
            : "btn-brand flex justify-center items-center"
        }`}
      >
        {active ? "Stop Tracking" : "Start Camera & Track Reps"}
      </button>
    </div>
  );
}
