# Classes Generation System

This documentation explains the class generation system for the MY-APP project. The system creates a complete grid of 135 character classes based on combinations of different attributes.

## Running the Generation Script

To generate all classes and update the `classes.json` file, follow these steps:

1. Navigate to your project directory in the terminal:
```bash
cd /workspaces/MY-APP
```

2. Run the generation script:
```bash
node assets/generate_classes.js
```

This will:
- Load the existing classes.json file
- Generate all 135 class combinations
- Add descriptive information about the key format
- Write the updated JSON back to the file
- Output confirmation messages with the total number of classes

## Path-to-Code Key Matching Logic

Each class is identified by a unique key in the **P-D-T-C** format:

| Component | Description | Values |
|-----------|-------------|--------|
| P | Path | 1=Mind, 2=Body, 3=Balanced |
| D | Difficulty | 1=Daily Trials, 2=Epic Missions, 3=Relentless Campaign, 4=Seasonal Conquests, 5=Spartan Trials |
| T | Tracking | 1=Leveling System, 2=Streaks & Habits, 3=Both |
| C | Consequence | 1=Yes Bring It On, 2=Choose My Own Punishments, 3=Without Consequence |

Example: `2-5-3-1` represents Body path, Spartan Trials difficulty, Both tracking types, with Yes Bring It On consequences.

The app uses these codes to:
1. Store user preferences in AsyncStorage during onboarding
2. Match keys to retrieve the appropriate class information 
3. Generate appropriate quest formats and descriptions

## Classes.json Structure

The generated classes.json file has the following structure:

```json
{
  "_description": { /* Key format explanation */ },
  "util": {
    "pathMap": { /* Path ID to name mapping */ },
    "difficultyMap": { /* Difficulty ID to name mapping */ },
    "trackingMap": { /* Tracking ID to name mapping */ },
    "consequenceMap": { /* Consequence ID to name mapping */ }
  },
  "classes": [
    /* Array of 135 class objects with all combinations */
    {
      "key": "1-1-1-1",
      "path": "Mind",
      "difficulty": "Daily Trials",
      "tracking": "Leveling System",
      "consequence": "Yes, Bring It On",
      "class": "Disciplined Sage",
      "description": "...",
      "quest_format": "...",
      "consequence_description": "..."
    },
    // ...more class objects
  ],
  "classMapping": { /* Path -> Difficulty -> Tracking -> Consequence -> Class name */ },
  "questTemplates": { /* Quest format templates by path and difficulty */ },
  "consequenceModifiers": { /* Consequence descriptions */ }
}
```

## How the Generation Function Works

The `generateAllClassEntries` function in class_generation.js creates all class combinations by:

1. Iterating through all possible combinations of paths, difficulties, trackings, and consequences
2. Looking up corresponding values in the mapping dictionaries
3. Building class descriptions and quest formats dynamically
4. Creating a consistent array of class objects with all necessary properties

```javascript
function generateAllClassEntries(classesJson) {
  const paths = [1, 2, 3];
  const difficulties = [1, 2, 3, 4, 5];
  const trackings = [1, 2, 3];
  const consequences = [1, 2, 3];
  
  // Nested loops to generate all combinations...
}
```

## Extending the Generation System

To modify or extend the class generation system:

### Adding New Paths

1. Update the `paths` array in class_generation.js
2. Add corresponding entries in `classesJson.util.pathMap`
3. Create new entries in `classMapping` and `questTemplates` for the new path

### Adding New Difficulties

1. Update the `difficulties` array in class_generation.js
2. Add corresponding entries in `classesJson.util.difficultyMap`
3. For each path, add new entries in `classMapping` and `questTemplates` for the new difficulty

### Adding New Tracking Methods

1. Update the `trackings` array in class_generation.js
2. Add corresponding entries in `classesJson.util.trackingMap`
3. Update the tracking suffix logic in the generation function
4. For each path and difficulty, add entries in `classMapping` for the new tracking type

### Adding New Consequence Types

1. Update the `consequences` array in class_generation.js
2. Add corresponding entries in `classesJson.util.consequenceMap`
3. Add an entry in `consequenceModifiers` for the new consequence type
4. Update the consequence suffix logic in the generation function
5. For each path, difficulty and tracking, add entries in `classMapping` for the new consequence

### Adding New Properties to Class Objects

To add new properties to each class object, modify the object creation in class_generation.js:

```javascript
allEntries.push({
  key: `${p}-${d}-${t}-${c}`,
  // Add your new property here
  newProperty: "Some calculated value",
  // Existing properties...
});
```

Then update the generate_classes.js script to ensure these new properties are preserved when writing to the JSON file.

## Tips for Future Modifications

1. Always test modifications with a small subset of combinations first
2. Back up your classes.json file before running bulk generation
3. Consider creating a separate script for testing new properties or calculation logic
4. When adding new dimensions, remember to update all related display and logic components in the app

## Complete Workflow

1. Modify mappings and templates in classes.json as needed
2. Update the generation logic in class_generation.js if necessary
3. Run the generation script to rebuild the complete class grid
4. Verify the output in the updated classes.json file
5. Update any app components that use the class data
