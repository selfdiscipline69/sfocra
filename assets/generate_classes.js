// Load the current classes JSON file
const fs = require('fs');
const path = require('path');

// Import your class generation function
const { generateAllClassEntries } = require('./class_generation');

// Load the existing classes.json
const classesJsonPath = path.join(__dirname, 'classes.json');
const classesJson = JSON.parse(fs.readFileSync(classesJsonPath, 'utf8'));

// Generate all 135 class entries
const allClasses = generateAllClassEntries(classesJson);

// Create description explaining the key format
const description = {
  "key_format": "P-D-T-C format where:",
  "P": "Path (1=Mind, 2=Body, 3=Balanced)",
  "D": "Difficulty (1=Daily Trials, 2=Epic Missions, 3=Relentless Campaign, 4=Seasonal Conquests, 5=Spartan Trials)",
  "T": "Tracking (1=Leveling System, 2=Streaks & Habits, 3=Both)",
  "C": "Consequence (1=Yes Bring It On, 2=Choose My Own Punishments, 3=Without Consequence)",
  "example": "2-5-3-1 represents Body path, Spartan Trials difficulty, Both tracking types, with Yes Bring It On consequences"
};

// Create a new object with the desired order (description first, then util)
const orderedJson = {
  "_description": description,
  "util": classesJson.util,
  "classes": allClasses,
  "classMapping": classesJson.classMapping,
  "questTemplates": classesJson.questTemplates,
  "consequenceModifiers": classesJson.consequenceModifiers
};

// Write the ordered JSON back to the file
const jsonContent = JSON.stringify(orderedJson, null, 2);

fs.writeFileSync(
  classesJsonPath,
  jsonContent,
  'utf8'
);

console.log(`Successfully generated all 135 class entries and saved to classes.json`);
console.log(`Total classes: ${allClasses.length}`);
console.log(`Added key format description at the TOP of the JSON file, followed by util section.`);