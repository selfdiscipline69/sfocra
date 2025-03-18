import json
import os

def apply_intensity_multiplier(activity, intensity, intensity_multipliers):
    """
    Apply the intensity multiplier to an activity's duration
    
    Args:
        activity (dict): The activity containing duration_minutes
        intensity (int): Intensity level (1-5)
        intensity_multipliers (dict): Dictionary mapping intensity levels to multipliers
        
    Returns:
        int or str: Scaled duration or error message
    """
    if isinstance(activity["duration_minutes"], int):
        scaled_duration = round(activity["duration_minutes"] * intensity_multipliers[intensity])
        return scaled_duration
    else:
        return f"intensity modification is required, standard is {activity['duration_minutes']}"

def generate_quest_json():
    # Base activities with standard durations (100% intensity level)
    base_activities = [
        # Mind activities (path 1)
        {"path": 1, "task": "Meditation", "duration_minutes": 30},
        {"path": 1, "task": "Journaling emotions and thoughts", "duration_minutes": 15},
        {"path": 1, "task": "Deep breathing exercises", "duration_minutes": 10},
        {"path": 1, "task": "Reading (book, article, etc.)", "duration_minutes": 30},
        {"path": 1, "task": "Online course or tutorial", "duration_minutes": 30},
        {"path": 1, "task": "Self-reflection on knowledge gained", "duration_minutes": 20},
        {"path": 1, "task": "Learning a new language (e.g., via app)", "duration_minutes": 25},
        {"path": 1, "task": "Watching educational documentary", "duration_minutes": 45},
        {"path": 1, "task": "Practicing a skill (e.g., coding, drawing)", "duration_minutes": 40},
        
        # Body activities (path 2)
        {"path": 2, "task": "Working out in the gym", "duration_minutes": 60},
        {"path": 2, "task": "Running", "duration_minutes": 20},
        {"path": 2, "task": "Stretching", "duration_minutes": 10},
        {"path": 2, "task": "Cycling", "duration_minutes": 45},
        {"path": 2, "task": "Bodyweight exercises (push-ups, squats, etc.)", "duration_minutes": 25},
        
        # Balanced activities (path 3)
        {"path": 3, "task": "Yoga session", "duration_minutes": 30},
        {"path": 3, "task": "Walking", "duration_minutes": 20},
        {"path": 3, "task": "Mindfulness practice (e.g., mindful eating)", "duration_minutes": 20},
        {"path": 3, "task": "Gratitude reflection", "duration_minutes": 10},
    ]

    # Intensity multipliers
    intensity_multipliers = {
        1: 0.5,  # 50% of standard duration
        2: 0.75, # 75% of standard duration
        3: 1.0,  # 100% of standard duration (original)
        4: 1.5,  # 150% of standard duration
        5: 2.0   # 200% of standard duration
    }

    # Generate all quest entries with varying intensities
    all_quests = []

    for activity in base_activities:
        for intensity in range(1, 6): # Intensity levels from 1 to 5
            duration = apply_intensity_multiplier(activity, intensity, intensity_multipliers)
            quest = {
                "key": f"{activity['path']}-{intensity}",
                "task": activity["task"],
                "duration_minutes": duration
            }
            all_quests.append(quest)

    quest_json_path = os.path.join(os.path.dirname(__file__), 'Quest.json')
    with open(quest_json_path, 'w', encoding='utf8') as f:
        json.dump(all_quests, f, indent=2)

    print(f"Successfully generated Quest.json with {len(all_quests)} quest entries")
    print(f"File saved to: {quest_json_path}")

    return all_quests

def read_quests():
    quest_json_path = os.path.join(os.path.dirname(__file__), 'Quest.json')
    if os.path.exists(quest_json_path):
        with open(quest_json_path, 'r', encoding='utf8') as f:
            quests = json.load(f)
        print(f"Loaded existing Quest.json with {len(quests)} quest entries")
        return quests
    else:
        print("Quest.json not found. Generating new quests...")
        return generate_quest_json()

def normalize_path_code(path_to_code):
    """
    Normalize the path code to the format "X-Y"
    
    Args:
        path_to_code (str): User input path code, could be "12" or "1-2"
        
    Returns:
        str: Normalized path code in the format "X-Y"
    """
    if '-' in path_to_code:
        return path_to_code
    elif len(path_to_code) == 2:
        return f"{path_to_code[0]}-{path_to_code[1]}"
    return path_to_code

def edit_quest(quests):
    while True:
        print("\nWelcome to the quests generation function, what do you want to do with the quests?")
        print("E: Exit program")
        print("R: Read and edit quests")
        print("O: Use default quests (regenerates Quest.json with base activities)")
        action = input("Enter your choice (E/R/O): ").strip().upper()
        
        if action == 'E':
            print("Exiting program.")
            break
        elif action == 'O':
            print("Regenerating quests using default base activities...")
            quests = generate_quest_json()
            print("Default quests have been generated. You can now read and edit them.")
        elif action == 'R':
            # First, show available paths to help the user
            available_paths = sorted(set(q['key'] for q in quests))
            print(f"Available paths (examples): {', '.join(available_paths[:5])}, ...")
            
            print("\nInstructions for path-to-code key:")
            print("Enter a path code like '1-2' (path 1, intensity 2)")
            print("You can also enter '12' which will be converted to '1-2'")
            print("A: Show all quests")
            print("B: Back to main menu")
            print("E: Exit program")
            
            path_to_code = input("\nEnter the path-to-code key: ").strip()
            if path_to_code.upper() == 'E':
                print("Exiting program.")
                return
            if path_to_code.upper() == 'B':
                continue
            if path_to_code.upper() == 'A':
                print("\nShowing all quests:")
                print("-" * 80)
                for idx, quest in enumerate(quests):
                    print(f"Quest {idx}: Key: {quest['key']} | Task: {quest['task']} | Duration: {quest['duration_minutes']} minutes")
                print("-" * 80)
                input("Press Enter to continue...")
                continue
            
            # Normalize path code to handle both "12" and "1-2" formats
            normalized_path = normalize_path_code(path_to_code)
            print(f"Looking for quests with path '{normalized_path}'...")
            
            filtered_quests = [q for q in quests if q['key'] == normalized_path]
            
            if not filtered_quests:
                print(f"No quests found with path '{normalized_path}'. Please try again.")
                continue
            
            print(f"\nFound {len(filtered_quests)} quests matching path '{normalized_path}':")
            print("-" * 80)
            for idx, quest in enumerate(filtered_quests):
                # Format the output to be more readable
                print(f"Index: {idx} | Key: {quest['key']} | Task: {quest['task']} | Duration: {quest['duration_minutes']} minutes")
            print("-" * 80)
            
            try:
                print("\nOptions:")
                print("Enter a number to edit that quest")
                print("B: Back to path selection")
                print("E: Exit program")
                index_input = input("Enter your choice: ").strip()
                if index_input.upper() == 'E':
                    print("Exiting program.")
                    return
                if index_input.upper() == 'B':
                    continue
                
                # Check if input is numerical
                if not index_input.isdigit():
                    print("Invalid input. Index should be a number.")
                    continue
                    
                index_key = int(index_input)
                if index_key >= len(filtered_quests):
                    print(f"Index {index_key} is out of range. Please enter a value between 0 and {len(filtered_quests)-1}.")
                    continue
                    
                quest_to_edit = filtered_quests[index_key]
                print(f"\nEditing quest: {quest_to_edit}")
                
                # Edit task
                print("\nTask Editing:")
                print("Enter new text to change the task")
                print("Leave empty to keep current value")
                print("E: Exit program")
                print("B: Back to quest selection")
                new_task = input(f"Current task: '{quest_to_edit['task']}'\nYour input: ").strip()
                if new_task.upper() == 'E':
                    print("Exiting program.")
                    return
                if new_task.upper() == 'B':
                    continue
                if new_task and new_task.upper() not in ['E', 'B']:
                    quest_to_edit['task'] = new_task
                
                # Edit duration
                print("\nDuration Editing:")
                print("Enter new number to change the duration")
                print("Leave empty to keep current value")
                print("E: Exit program")
                print("B: Back to task editing")
                new_duration = input(f"Current duration: '{quest_to_edit['duration_minutes']}' minutes\nYour input: ").strip()
                if new_duration.upper() == 'E':
                    print("Exiting program.")
                    return
                if new_duration.upper() == 'B':
                    continue
                if new_duration and new_duration.upper() not in ['E', 'B']:
                    # Try to convert to int if possible
                    try:
                        quest_to_edit['duration_minutes'] = int(new_duration)
                    except ValueError:
                        quest_to_edit['duration_minutes'] = new_duration
                
                print(f"\nUpdated quest: {quest_to_edit}")
                
                print("\nSave Options:")
                print("S: Save changes")
                print("E: Exit without saving")
                print("B: Back without saving")
                save_input = input("Your choice: ").strip().upper()
                if save_input == 'S':
                    for idx, quest in enumerate(quests):
                        if quest['key'] == quest_to_edit['key']:
                            quests[idx] = quest_to_edit
                            break
                    with open(os.path.join(os.path.dirname(__file__), 'Quest.json'), 'w', encoding='utf8') as f:
                        json.dump(quests, f, indent=2)
                    print("Quest updated and saved.")
                elif save_input == 'E':
                    print("Exiting program.")
                    return
                elif save_input == 'B':
                    print("Going back without saving changes.")
                    continue
                    
            except ValueError:
                print("Invalid index. Please enter a numeric value.")
                continue
            except IndexError:
                print(f"Index {index_input} is out of range. Please enter a value between 0 and {len(filtered_quests)-1}.")
                continue
        else:
            print("Invalid option. Please enter 'E' to exit, 'R' to read quests, or 'O' to use default quests.")

if __name__ == "__main__":
    # First check if Quest.json exists, otherwise generate it
    quests = read_quests()
    edit_quest(quests)