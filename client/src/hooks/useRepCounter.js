import { useState, useRef, useCallback, useEffect } from "react";
import { EXERCISE_RULES } from "../utils/angles";

export function useRepCounter(exercise) {
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState("up"); // "up" or "down"
  const [formWarning, setFormWarning] = useState(null);
  const stageRef = useRef("up");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setReps(0);
    setStage("up");
    stageRef.current = "up";
    setFormWarning(null);
  }, [exercise]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const processKeypoints = useCallback((keypoints) => {
    const rule = EXERCISE_RULES[exercise];
    if (!rule) return;

    const angle = rule.getAngle(keypoints);
    if (angle === null) return; 

    const warning = rule.formCheck(keypoints);
    setFormWarning(warning);

    if (angle < rule.downThreshold && stageRef.current === "up") {
      stageRef.current = "down";
      setStage("down");
    }
    if (angle > rule.upThreshold && stageRef.current === "down") {
      stageRef.current = "up";
      setStage("up");
      setReps(prev => prev + 1);
    }
  }, [exercise]);

  return { reps, stage, formWarning, processKeypoints };
}
