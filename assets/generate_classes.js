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

// Update the classes array in the JSON
classesJson.classes = allClasses;

// Write the updated JSON back to the file
fs.writeFileSync(
  classesJsonPath,
  JSON.stringify(classesJson, null, 2),
  'utf8'
);

console.log(`Successfully generated all 135 class entries and saved to classes.json`);
console.log(`Total classes: ${allClasses.length}`);