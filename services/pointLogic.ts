import { DailyLog } from '../types';

export const calculatePoints = (
  log: Pick<DailyLog, 'studyHours' | 'wastedHours' | 'wakeTime' | 'tasksAssigned' | 'tasksCompleted'>
) => {
  let studyPoints = 0;
  let taskPoints = 0;
  let wakePoints = 0;
  let wastePenalty = 0;

  // 1. Study Hours (5 points per hour)
  studyPoints = Math.round(log.studyHours * 5);

  // 2. Task Completion Bracket (with extra credit for over-achievement)
  if (log.tasksAssigned > 0) {
    const percentage = (log.tasksCompleted / log.tasksAssigned) * 100;

    if (percentage >= 180) taskPoints = 30;       // 180-200%: +30
    else if (percentage >= 150) taskPoints = 25;  // 150-180%: +25
    else if (percentage >= 120) taskPoints = 20;  // 120-150%: +20
    else if (percentage >= 100) taskPoints = 15;  // 100-120%: +15
    else if (percentage >= 91) taskPoints = 10;   // 91-100%: +10
    else if (percentage >= 81) taskPoints = 0;    // 81-90%: 0
    else taskPoints = -10;                         // ≤80%: -10
  }

  // 3. Wake Up Time Bonus
  // Parse HH:MM
  const [hours, minutes] = log.wakeTime.split(':').map(Number);
  const wakeDecimal = hours + minutes / 60;

  if (wakeDecimal <= 6) wakePoints = 15;
  else if (wakeDecimal <= 7) wakePoints = 10;
  else if (wakeDecimal <= 8) wakePoints = 5;
  else wakePoints = 0;

  // 4. Wasted Time Penalty (-5 per hour)
  wastePenalty = Math.round(log.wastedHours * 5); // Subtracted later

  const total = studyPoints + taskPoints + wakePoints - wastePenalty;

  return {
    total,
    breakdown: {
      study: studyPoints,
      tasks: taskPoints,
      wake: wakePoints,
      waste: -wastePenalty
    }
  };
};
