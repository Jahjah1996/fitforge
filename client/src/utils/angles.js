export function calculateAngle(A, B, C) {
  const radians = Math.atan2(C.y - B.y, C.x - B.x)
                - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export const EXERCISE_RULES = {
  squat: {
    getAngle: (kp) => {
      const hip = kp[11];
      const knee = kp[13];
      const ankle = kp[15];
      if (!hip || !knee || !ankle || hip.score < 0.3 || knee.score < 0.3 || ankle.score < 0.3) return null;
      return calculateAngle(hip, knee, ankle);
    },
    downThreshold: 90,
    upThreshold: 160,
    formCheck: (kp) => {
      const knee = kp[13];
      const ankle = kp[15];
      if (!knee || !ankle || knee.score < 0.3 || ankle.score < 0.3) return null;
      if (Math.abs(knee.x - ankle.x) > 50) return "Keep knees over toes!";
      return null;
    }
  },
  pushup: {
    getAngle: (kp) => {
      const shoulder = kp[5];
      const elbow = kp[7];
      const wrist = kp[9];
      if (!shoulder || !elbow || !wrist || shoulder.score < 0.3 || elbow.score < 0.3 || wrist.score < 0.3) return null;
      return calculateAngle(shoulder, elbow, wrist);
    },
    downThreshold: 90,
    upThreshold: 160,
    formCheck: (kp) => {
      const hip = kp[11];
      const shoulder = kp[5];
      if (!hip || !shoulder || hip.score < 0.3 || shoulder.score < 0.3) return null;
      if (hip.y - shoulder.y > 80) return "Don't sag your hips!";
      return null;
    }
  }
};
