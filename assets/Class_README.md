# Classification System

This documentation explains the classification systems for the MY-APP project, including class generation and quest generation.

## Class Generation System

The system creates a complete grid of 135 character classes based on combinations of different attributes.

### Running the Class Generation Script

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

### Path-to-Code Key Matching Logic

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

### Classes.json Structure

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

### How the Class Generation Function Works

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

### Extending the Class Generation System

To modify or extend the class generation system:

#### Adding New Paths

1. Update the `paths` array in class_generation.js
2. Add corresponding entries in `classesJson.util.pathMap`
3. Create new entries in `classMapping` and `questTemplates` for the new path

#### Adding New Difficulties

1. Update the `difficulties` array in class_generation.js
2. Add corresponding entries in `classesJson.util.difficultyMap`
3. For each path, add new entries in `classMapping` and `questTemplates` for the new difficulty

#### Adding New Tracking Methods

1. Update the `trackings` array in class_generation.js
2. Add corresponding entries in `classesJson.util.trackingMap`
3. Update the tracking suffix logic in the generation function
4. For each path and difficulty, add entries in `classMapping` for the new tracking type

#### Adding New Consequence Types

1. Update the `consequences` array in class_generation.js
2. Add corresponding entries in `classesJson.util.consequenceMap`
3. Add an entry in `consequenceModifiers` for the new consequence type
4. Update the consequence suffix logic in the generation function
5. For each path, difficulty and tracking, add entries in `classMapping` for the new consequence

#### Adding New Properties to Class Objects

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

## Quest Generation System

The quest generation system creates a complete set of activities at different intensity levels for each path.

### Running the Quest Generation Script

To generate all quests and update the `Quest.json` file:

1. Navigate to your project directory in the terminal:
```bash
cd /workspaces/MY-APP
```

2. Run the generation script:
```bash
node assets/generate_quests.js
```

This will:
- Generate activities at 5 different intensity levels
- Apply appropriate scaling to each activity's duration
- Write the complete quest list to Quest.json
- Output confirmation with the total number of quest entries generated

### How the Quest Generation Works

The system uses a base list of activities, each with:
- `path`: Path identifier (1=Mind, 2=Body, 3=Balanced)
- `task`: Description of the activity
- `duration_minutes`: Standard duration (100% intensity)

For each activity, the system generates 5 intensity levels with scaled durations:
- Level 1: 50% of standard duration
- Level 2: 75% of standard duration
- Level 3: 100% of standard duration (original)
- Level 4: 150% of standard duration
- Level 5: 200% of standard duration

### Quest Key Format

Each quest is identified by a key in the format `{path}-{intensity}`:
- First number: Path (1=Mind, 2=Body, 3=Balanced)
- Second number: Intensity level (1-5)

Example: `2-4` represents a Body path activity at intensity level 4 (150% of standard duration).

### Customizing Quest Activities

To modify the available quest activities:

1. Edit the `baseActivities` array in the `generate_quests.js` file:

```javascript
const baseActivities = [
  // Existing activities...
  
  // Add a new activity
  { path: 2, task: "Swimming", duration_minutes: 30 },
  
  // Or modify an existing activity
  { path: 1, task: "Meditation", duration_minutes: 20 }, // Changed from 30 minutes
];
```

2. Run the script again to regenerate the Quest.json file:

```bash
node assets/generate_quests.js
```

### Quest.json Structure

The generated Quest.json file has the following structure:

```json
[
  {
    "key": "1-1",
    "task": "Meditation",
    "duration_minutes": 15
  },
  {
    "key": "1-2",
    "task": "Meditation",
    "duration_minutes": 22
  },
  {
    "key": "1-3",
    "task": "Meditation",
    "duration_minutes": 30
  },
  // ...more quest entries
]
```

### Advanced Customization

To modify the intensity scaling, adjust the `intensityMultipliers` object:

```javascript
const intensityMultipliers = {
  1: 0.4,  // Changed from 0.5 (now 40% of standard)
  2: 0.7,  // Changed from 0.75 (now 70% of standard)
  3: 1.0,  // Standard (unchanged)
  4: 1.25, // Changed from 1.5 (now 125% of standard)
  5: 1.75  // Changed from 2.0 (now 175% of standard)
};
```

To add additional properties to each quest, modify the quest object creation:

```javascript
const quest = {
  key: `${activity.path}-${intensity}`,
  task: activity.task,
  duration_minutes: scaledDuration,
  // Add new properties
  category: activity.category || "General",
  xp_reward: scaledDuration * 2
};
```

## Tips for Future Modifications

1. Always test modifications with a small subset first
2. Back up your JSON files before running bulk generation
3. Consider creating separate scripts for testing new properties or calculation logic
4. When adding new dimensions, remember to update all related display and logic components in the app

## Complete Workflow

1. Modify mappings and templates as needed
2. Update the generation logic if necessary
3. Run the generation scripts to rebuild the complete data
4. Verify the output in the updated JSON files
5. Update any app components that use the data
```

This updated documentation should be saved as `Classification_README.md` in the `/workspaces/MY-APP/assets/` directory.This updated documentation should be saved as `Classification_README.md` in the `/workspaces/MY-APP/assets/` directory.