# Quest Generation System Documentation

This documentation explains how to manage tasks through the TaskLibrary.json and use the quest generation utility.

## Table of Contents
1. [Task Library Management](#task-library-management)
2. [Quest Generation Utility](#quest-generation-utility)
3. [Command Line Usage](#command-line-usage)
4. [Quest ID Format](#quest-id-format)

## Task Library Management

### TaskLibrary.json Structure

Tasks are defined in `assets/TaskLibrary.json` with the following structure:

```json
{
  "task-id": {
    "task": "Human-readable task name",
    "category": "category-name",
    "intensities": {
      "1": {"duration": "beginner duration"},
      "2": {"duration": "easy duration"},
      "3": {"duration": "intermediate duration"},
      "4": {"duration": "advanced duration"},
      "5": {"duration": "expert duration"}
    }
  }
}
```

### Adding a New Task

1. Open `TaskLibrary.json`
2. Add a new entry following the structure:

```json
"new-task-id": {
  "task": "Your New Task Name",
  "category": "mindfulness|learning|physical|social|creativity",
  "intensities": {
    "1": {"duration": "5 minutes"},
    "2": {"duration": "10 minutes"},
    "3": {"duration": "15 minutes"},
    "4": {"duration": "20 minutes"},
    "5": {"duration": "30 minutes"}
  }
}
```

### Editing Tasks

1. Locate the task in `TaskLibrary.json`
2. Modify any of these elements:
   - Task description
   - Category
   - Duration for each intensity level

### Categories
Available categories:
- mindfulness
- learning
- physical
- social
- creativity

### Duration Formats
You can use various formats for duration:
- Time: "10 minutes", "1 hour"
- Distance: "2 km", "5 miles"
- Sets: "3 sets", "10 repetitions"
- Custom: "Cook a simple meal", "Read one chapter"

## Quest Generation Utility

### Running the Generator

The generator can be run in three modes:

1. Interactive Mode (Default):
```bash
python assets/generate_quests.py
```

2. Direct Generation:
```bash
python assets/generate_quests.py --generate
```

3. Multiple Variations:
```bash
python assets/generate_quests.py --generate --variations 3
```

### Interactive Mode Features

- **Read/Edit (R)**: View and navigate through existing quests
- **Generate (G)**: Create new Quest.json with default settings
- **Variations (V)**: Generate multiple variations of quests
- **Exit (E)**: Exit the program

### Navigation in Interactive Mode

1. Select a path using the format:
   - "1-2" (path 1, intensity 2)
   - "12" (automatically converted to "1-2")
   
2. View quest details:
   - Weekly plans
   - Daily tasks
   - Task durations

## Quest ID Format

Quest IDs follow the format: `{path-code}-{intensity}-{variation}`

Path Codes:
- Mental: 1
- Physical: 2
- Balanced: 3

Example IDs:
- "1-4-2": Mental path, intensity 4, variation 2
- "2-3-1": Physical path, intensity 3, variation 1
- "3-5-3": Balanced path, intensity 5, variation 3

## Best Practices

1. **Backup**: Always backup `TaskLibrary.json` before making significant changes

2. **Testing**: After editing tasks:
   - Run the generator to ensure JSON is valid
   - Check if new tasks appear in generated quests
   - Verify task durations are appropriate for each intensity

3. **Task Categories**: Keep categories consistent for proper app functionality

4. **Duration Scaling**: Ensure logical progression between intensity levels

5. **Task IDs**: Use descriptive, hyphenated lowercase IDs (e.g., "deep-breathing")

## Common Issues

1. **Invalid JSON**: Ensure proper formatting:
   - No trailing commas
   - Properly quoted strings
   - Valid nested structure

2. **Missing Intensities**: Each task must have at least intensity level "1"

3. **Category Errors**: Use only predefined categories

4. **File Access**: Ensure proper file permissions for TaskLibrary.json

## Support

For additional support or to report issues:
1. Check file permissions
2. Verify JSON syntax
3. Ensure all required fields are present
4. Run generator with --generate flag to test changes

Remember to regenerate Quest.json after any modifications to TaskLibrary.json to apply your changes. 