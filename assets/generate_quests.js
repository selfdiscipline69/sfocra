const fs = require('fs');
const path = require('path');

/**
 * Generate a complete Quest.json file with activities at different intensity levels
 */
function generateQuestJson() {
  // Base activities with standard durations (100% intensity level)
  const baseActivities = [
    // Mind activities (path 1)
    { path: 1, task: "Meditation", duration_minutes: 30 },
    { path: 1, task: "Journaling emotions and thoughts", duration_minutes: 15 },
    { path: 1, task: "Deep breathing exercises", duration_minutes: 10 },
    { path: 1, task: "Reading (book, article, etc.)", duration_minutes: 30 },
    { path: 1, task: "Online course or tutorial", duration_minutes: 30 },
    { path: 1, task: "Self-reflection on knowledge gained", duration_minutes: 20 },
    { path: 1, task: "Learning a new language (e.g., via app)", duration_minutes: 25 },
    { path: 1, task: "Watching educational documentary", duration_minutes: 45 },
    { path: 1, task: "Practicing a skill (e.g., coding, drawing)", duration_minutes: 40 },
    
    // Body activities (path 2)
    { path: 2, task: "Working out in the gym", duration_minutes: 60 },
    { path: 2, task: "Running", duration_minutes: 20 },
    { path: 2, task: "Stretching", duration_minutes: 10 },
    { path: 2, task: "Cycling", duration_minutes: 45 },
    { path: 2, task: "Bodyweight exercises (push-ups, squats, etc.)", duration_minutes: 25 },
    
    // Balanced activities (path 3)
    { path: 3, task: "Yoga session", duration_minutes: 30 },
    { path: 3, task: "Walking", duration_minutes: 20 },
    { path: 3, task: "Mindfulness practice (e.g., mindful eating)", duration_minutes: 20 },
    { path: 3, task: "Gratitude reflection", duration_minutes: 10 },
  ];

  // Intensity multipliers
  const intensityMultipliers = {
    1: 0.5,  // 50% of standard duration
    2: 0.75, // 75% of standard duration
    3: 1.0,  // 100% of standard duration (original)
    4: 1.5,  // 150% of standard duration
    5: 2.0   // 200% of standard duration
  };

  // Generate all quest entries with varying intensities
  const allQuests = [];

  baseActivities.forEach(activity => {
    // Generate an entry for each intensity level (1-5)
    for (let intensity = 1; intensity <= 5; intensity++) {
      // Calculate duration based on intensity level
      const scaledDuration = Math.round(activity.duration_minutes * intensityMultipliers[intensity]);
      
      // Create quest entry
      const quest = {
        key: `${activity.path}-${intensity}`,
        task: activity.task,
        duration_minutes: scaledDuration
      };
      
      allQuests.push(quest);
    }
  });

  // Write to JSON file
  const questJsonPath = path.join(__dirname, 'Quest.json');
  fs.writeFileSync(
    questJsonPath,
    JSON.stringify(allQuests, null, 2),
    'utf8'
  );

  console.log(`Successfully generated Quest.json with ${allQuests.length} quest entries`);
  console.log(`File saved to: ${questJsonPath}`);
  
  return allQuests;
}

// Run the generator
generateQuestJson();