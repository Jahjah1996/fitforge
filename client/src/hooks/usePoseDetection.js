import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection/dist/pose-detection.js";

export function usePoseDetection(active, videoRef, canvasRef, onKeypoints) {
  const detectorRef = useRef(null);
  const animRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let detectLoop = true;

    async function load() {
      try {
        await tf.ready();
        if (!isMounted) return;
        if (!detectorRef.current) {
          const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
          );
          detectorRef.current = detector;
        }
        setIsReady(true);
        if (active) {
          detect();
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError(err.message || String(err));
      }
    }

    async function detect() {
      if (!isMounted || !detectLoop || !active) return;
      if (!videoRef.current || !detectorRef.current || !videoRef.current.video) {
        animRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current.video;
      if (video.readyState === 4 && video.videoWidth > 0) {
        try {
          const poses = await detectorRef.current.estimatePoses(video);
          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            onKeypoints(keypoints);
            drawSkeleton(keypoints, canvasRef.current);
          }
        } catch (e) {
          console.error("Pose detection error:", e);
        }
      }
      
      setTimeout(() => {
        if (detectLoop && active) animRef.current = requestAnimationFrame(detect);
      }, 50);
    }

    load();

    return () => {
      detectLoop = false;
      isMounted = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active, canvasRef, onKeypoints, videoRef]);

  return { isReady, error };
}

function drawSkeleton(keypoints, canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const CONNECTIONS = [
    [5, 7], [7, 9],     // left arm
    [6, 8], [8, 10],    // right arm
    [5, 6],             // shoulders
    [5, 11], [6, 12],   // torso
    [11, 12],           // hips
    [11, 13], [13, 15], // left leg
    [12, 14], [14, 16]  // right leg
  ];

  ctx.strokeStyle = "#10b981"; // green-500
  ctx.lineWidth = 3;

  CONNECTIONS.forEach(([a, b]) => {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    if (kpA.score > 0.3 && kpB.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(kpA.x, kpA.y);
      ctx.lineTo(kpB.x, kpB.y);
      ctx.stroke();
    }
  });

  keypoints.forEach(kp => {
    if (kp.score > 0.3) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}
