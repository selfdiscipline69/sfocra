import json
import os
import copy

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
    """
    Generate a complete Quest.json file with activities at different intensity levels
    Ensures the generated file exactly matches the base activities defined here
    """
    # Base activities with standard durations (100% intensity level)
    base_activities = [
        # Mind activities (path 1)
        {"path": 1, "task": "Meditation", "duration_minutes": 30},
        {"path": 1, "task": "Journaling emotions and thoughts", "duration_minutes": 15},
        {"path": 1, "task": "Book Reading", "duration_minutes": "1 chapter"},
        {"path": 1, "task": "Listening to a podcast", "duration_minutes": "1 episode"},
        {"path": 1, "task": "Listening to chill/ mindful music", "duration_minutes": 20},
        {"path": 1, "task": "Drawing or painting", "duration_minutes": 45},
        {"path": 1, "task": "Creative writing (poetry, short stories)", "duration_minutes": 30},
        {"path": 1, "task": "Playing a musical instrument", "duration_minutes": 45},
        {"path": 1, "task": "Online Tutorial (exercising, yoga, coding, language, communication)", "duration_minutes": 30},
        {"path": 1, "task": "Self-reflection", "duration_minutes": 20},
        {"path": 1, "task": "Learning a new language (e.g., via app)", "duration_minutes": 25},
        {"path": 1, "task": "Watching educational documentary", "duration_minutes": 45},
        {"path": 1, "task": "Cook a fine dinner", "duration_minutes": "1 time"},
        {"path": 1, "task": "article reading", "duration_minutes": "3 articles"},
        
        # Body activities (path 2)
        {"path": 2, "task": "Working out in the gym", "duration_minutes": 60},
        {"path": 2, "task": "Running", "duration_minutes": "5 km"},
        {"path": 2, "task": "Stretching", "duration_minutes": 10},
        {"path": 2, "task": "Cycling", "duration_minutes": "15 km"},
        {"path": 2, "task": "Bodyweight exercises (push-ups, squats, etc.)", "duration_minutes": "3 sets"},
        {"path": 2, "task": "hiking", "duration_minutes": "10 km"},
        {"path": 2, "task": "Swimming", "duration_minutes": "1 km"},
        {"path": 2, "task": "Dancing", "duration_minutes": 30},
        {"path": 2, "task": "yoga or Pilates", "duration_minutes": 45},
        {"path": 2, "task": "massages for muscle recovery", "duration_minutes": 60},
        
        # Balanced activities (path 3)
        {"path": 3, "task": "Yoga session", "duration_minutes": 30},
        {"path": 3, "task": "Walking", "duration_minutes": "3 km"},
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

    print(f"DEBUG: Generating quests from {len(base_activities)} base activities")
    for activity in base_activities:
        print(f"DEBUG: Processing activity: {activity['task']}")
        for intensity in range(1, 6):  # Intensity levels from 1 to 5
            # For each base activity, create a quest entry for each intensity level
            quest = {
                "key": f"{activity['path']}-{intensity}",
                "task": activity["task"],
            }
            
            # Apply intensity multiplier if duration is a number, otherwise use the special message
            if isinstance(activity["duration_minutes"], int):
                quest["duration_minutes"] = round(activity["duration_minutes"] * intensity_multipliers[intensity])
            else:
                if intensity == 3:  # Standard intensity (100%)
                    quest["duration_minutes"] = activity["duration_minutes"]
                else:
                    quest["duration_minutes"] = f"intensity modification is required, standard is {activity['duration_minutes']}"
                    
            all_quests.append(quest)

    # Get the absolute path for Quest.json
    quest_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Quest.json')
    print(f"DEBUG: Will write to absolute path: {quest_json_path}")
    
    # Skip deletion and directly overwrite
    with open(quest_json_path, 'w', encoding='utf8') as f:
        json.dump(all_quests, f, indent=2)
    print(f"Successfully generated Quest.json with {len(all_quests)} quest entries ({len(base_activities)} base activities × 5 intensity levels)")
    print(f"File saved to: {quest_json_path}")

    return all_quests

def read_quests():
    quest_json_path = os.path.join(os.path.dirname(__file__), 'Quest.json')
    if (os.path.exists(quest_json_path)):
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

def display_quest_info(quest):
    """Display formatted quest information"""
    print("\n" + "-" * 80)
    print("Current Quest Information:")
    print(f"Key: {quest['key']}")
    print(f"Task: {quest['task']}")
    print(f"Duration: {quest['duration_minutes']} minutes")
    print("-" * 80)

def edit_quest(quests):
    while True:
        print("\n" + "-" * 80)
        print("Welcome to the quests generation function, what do you want to do with the quests?")
        print("E: Exit program")
        print("R: Read and edit quests")
        print("O: Use default quests (regenerates Quest.json with base activities)")
        print("N: Create a new quest")
        action = input("Enter your choice (E/R/O/N): ").strip().upper()
        
        if action == 'E':
            print("\n" + "-" * 80)
            print("Exiting program.")
            break
        elif action == 'O':
            print("\n" + "-" * 80)
            print("Regenerating quests using default base activities...")
            
            # Get the absolute path for Quest.json
            quest_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Quest.json')
            print(f"Quest.json location: {quest_json_path}")
            
            # First ensure the old file is deleted
            try:
                if (os.path.exists(quest_json_path)):
                    # Force file close in case it's being held open
                    import gc
                    gc.collect()  # Run garbage collection to close any lingering file handles
                    
                    # Try to remove the file
                    os.remove(quest_json_path)
                    print(f"Old Quest.json file removed successfully from: {quest_json_path}")
                else:
                    print("No existing Quest.json file found.")
            except Exception as e:
                print(f"Warning: Could not remove old file: {e}")
                # If deletion fails, try a more aggressive approach
                try:
                    import subprocess
                    subprocess.run(['rm', '-f', quest_json_path], check=True)
                    print("Used system command to force remove the file.")
                except Exception as e2:
                    print(f"Failed to remove file using system command: {e2}")
            
            # Generate new quests with fresh data and return them directly
            quests = generate_quest_json()
            
            # Verify the file exists with the correct content
            if os.path.exists(quest_json_path):
                file_size = os.path.getsize(quest_json_path)
                print(f"Verified: New Quest.json file created with size {file_size} bytes.")
            else:
                print("Warning: Failed to create new Quest.json file.")
            
            print("\n" + "-" * 80)
            print("Default quests have been generated and loaded. You can now read and edit them.")
        elif action == 'N':
            create_new_quest(quests)
        elif action == 'R':
            print("\n" + "-" * 80)
            # First, show available paths to help the user
            available_paths = sorted(set(q['key'] for q in quests))
            print(f"Available paths (examples): {', '.join(available_paths[:5])}, ...")
            
            print("\n" + "-" * 80)
            print("Instructions for path-to-code key:")
            print("Enter a path code like '1-2' (path 1, intensity 2)")
            print("You can also enter '12' which will be converted to '1-2'")
            print("A: Show all quests")
            print("B: Back to main menu")
            print("E: Exit program")
            
            path_to_code = input("\nEnter the path-to-code key: ").strip()
            if (path_to_code.upper() == 'E'):
                print("\n" + "-" * 80)
                print("Exiting program.")
                return
            if path_to_code.upper() == 'B':
                continue
            if path_to_code.upper() == 'A':
                print("\n" + "-" * 80)
                print("Showing all quests:")
                print("-" * 80)
                for idx, quest in enumerate(quests):
                    print(f"Quest {idx}: Key: {quest['key']} | Task: {quest['task']} | Duration: {quest['duration_minutes']} minutes")
                print("-" * 80)
                input("Press Enter to continue...")
                continue
            
            # Normalize path code to handle both "12" and "1-2" formats
            normalized_path = normalize_path_code(path_to_code)
            print("\n" + "-" * 80)
            print(f"Looking for quests with path '{normalized_path}'...")
            
            filtered_quests = [q for q in quests if q['key'] == normalized_path]
            
            if not filtered_quests:
                print("\n" + "-" * 80)
                print(f"No quests found with path '{normalized_path}'. Please try again.")
                continue
            
            print("\n" + "-" * 80)
            print(f"Found {len(filtered_quests)} quests matching path '{normalized_path}':")
            print("-" * 80)
            for idx, quest in enumerate(filtered_quests):
                # Format the output to be more readable
                print(f"Index: {idx} | Key: {quest['key']} | Task: {quest['task']} | Duration: {quest['duration_minutes']} minutes")
            print("-" * 80)
            
            try:
                print("\n" + "-" * 80)
                print("Options:")
                print("Enter a number to edit that quest")
                print("N: Add a new quest")
                print("B: Back to path selection")
                print("E: Exit program")
                index_input = input("Enter your choice: ").strip()
                
                if index_input.upper() == 'E':
                    print("\n" + "-" * 80)
                    print("Exiting program.")
                    return
                if index_input.upper() == 'B':
                    continue
                if index_input.upper() == 'N':
                    create_new_quest(quests)
                    continue
                
                # Check if input is numerical
                if not index_input.isdigit():
                    print("\n" + "-" * 80)
                    print("Invalid input. Index should be a number.")
                    continue
                    
                index_key = int(index_input)
                if index_key >= len(filtered_quests):
                    print("\n" + "-" * 80)
                    print(f"Index {index_key} is out of range. Please enter a value between 0 and {len(filtered_quests)-1}.")
                    continue
                    
                quest_to_edit = filtered_quests[index_key]
                # Store original quest for undo functionality
                original_quest = copy.deepcopy(quest_to_edit)
                
                # Display the current quest
                display_quest_info(quest_to_edit)
                
                # Edit category/key
                print("\n" + "-" * 80)
                print("Category/Key Editing:")
                print("Enter new key to change the category (format: 'X-Y' or 'XY')")
                print("Leave empty to keep current value")
                print("U: Undo all changes and revert to original")
                print("E: Exit program")
                print("B: Back to quest selection without saving")
                
                new_key = input(f"Current key: '{quest_to_edit['key']}'\nYour input: ").strip()
                
                if new_key.upper() == 'E':
                    print("\n" + "-" * 80)
                    print("Exiting program.")
                    return
                if new_key.upper() == 'B':
                    print("\n" + "-" * 80)
                    print("Going back to quest selection without saving changes.")
                    continue
                if new_key.upper() == 'U':
                    quest_to_edit = original_quest
                    print("\n" + "-" * 80)
                    print("Changes undone. Reverted to original quest.")
                    display_quest_info(quest_to_edit)
                
                key_changed = False
                if new_key and new_key.upper() not in ['E', 'B', 'U']:
                    # Normalize the new key format
                    new_key = normalize_path_code(new_key)
                    quest_to_edit['key'] = new_key
                    key_changed = True
                    print("\n" + "-" * 80)
                    print("Key updated.")
                    display_quest_info(quest_to_edit)
                
                # Edit task
                print("\n" + "-" * 80)
                print("Task Editing:")
                print("Enter new text to change the task")
                print("Leave empty to keep current value")
                print("U: Undo all changes and revert to original")
                print("E: Exit program")
                print("B: Back to quest selection without saving")
                
                new_task = input(f"Current task: '{quest_to_edit['task']}'\nYour input: ").strip()
                
                if new_task.upper() == 'E':
                    print("\n" + "-" * 80)
                    print("Exiting program.")
                    return
                if new_task.upper() == 'B':
                    print("\n" + "-" * 80)
                    print("Going back to quest selection without saving changes.")
                    continue
                if new_task.upper() == 'U':
                    quest_to_edit = original_quest
                    print("\n" + "-" * 80)
                    print("Changes undone. Reverted to original quest.")
                    display_quest_info(quest_to_edit)
                elif new_task and new_task.upper() not in ['E', 'B', 'U']:
                    quest_to_edit['task'] = new_task
                    print("\n" + "-" * 80)
                    print("Task updated.")
                    display_quest_info(quest_to_edit)
                
                # Edit duration
                print("\n" + "-" * 80)
                print("Duration Editing:")
                print("Enter new number to change the duration")
                print("Leave empty to keep current value")
                print("U: Undo all changes and revert to original")
                print("E: Exit program")
                print("B: Back to quest selection without saving")
                
                new_duration = input(f"Current duration: '{quest_to_edit['duration_minutes']}' minutes\nYour input: ").strip()
                
                if new_duration.upper() == 'E':
                    print("\n" + "-" * 80)
                    print("Exiting program.")
                    return
                if new_duration.upper() == 'B':
                    print("\n" + "-" * 80)
                    print("Going back to quest selection without saving changes.")
                    continue
                if new_duration.upper() == 'U':
                    quest_to_edit = original_quest
                    print("\n" + "-" * 80)
                    print("Changes undone. Reverted to original quest.")
                    display_quest_info(quest_to_edit)
                elif new_duration and new_duration.upper() not in ['E', 'B', 'U']:
                    # Try to convert to int if possible
                    try:
                        quest_to_edit['duration_minutes'] = int(new_duration)
                    except ValueError:
                        quest_to_edit['duration_minutes'] = new_duration
                    print("\n" + "-" * 80)
                    print("Duration updated.")
                    display_quest_info(quest_to_edit)
                
                print("\n" + "-" * 80)
                print("Save Options:")
                print("S: Save changes")
                print("U: Undo all changes and revert to original")
                print("E: Exit without saving")
                print("B: Back to quest selection without saving")
                
                save_input = input("Your choice: ").strip().upper()
                
                if save_input == 'S':
                    # If key was changed, we need to remove the old quest and add the new one
                    if key_changed:
                        # First, find and remove the original quest
                        for idx, quest in enumerate(quests):
                            if quest['key'] == original_quest['key'] and quest['task'] == original_quest['task']:
                                quests.pop(idx)
                                break
                        # Then add the edited quest
                        quests.append(quest_to_edit)
                    else:
                        # Just update the existing quest
                        for idx, quest in enumerate(quests):
                            if quest['key'] == quest_to_edit['key'] and quest['task'] == original_quest['task']:
                                quests[idx] = quest_to_edit
                                break
                    
                    with open(os.path.join(os.path.dirname(__file__), 'Quest.json'), 'w', encoding='utf8') as f:
                        json.dump(quests, f, indent=2)
                    print("\n" + "-" * 80)
                    print("Quest updated and saved.")
                    
                elif save_input == 'U':
                    print("\n" + "-" * 80)
                    print("Changes undone. Reverted to original quest.")
                    continue
                elif save_input == 'E':
                    print("\n" + "-" * 80)
                    print("Exiting program.")
                    return
                elif save_input == 'B':
                    print("\n" + "-" * 80)
                    print("Going back without saving changes.")
                    continue
                    
            except ValueError:
                print("\n" + "-" * 80)
                print("Invalid index. Please enter a numeric value.")
                continue
            except IndexError:
                print("\n" + "-" * 80)
                print(f"Index {index_input} is out of range. Please enter a value between 0 and {len(filtered_quests)-1}.")
                continue
        else:
            print("\n" + "-" * 80)
            print("Invalid option. Please enter 'E' to exit, 'R' to read quests, 'N' to create a new quest, or 'O' to use default quests.")

def create_new_quest(quests):
    """Create a new quest from scratch"""
    print("\n" + "-" * 80)
    print("Creating a new quest:")
    
    # Get the path/key
    while True:
        print("\nEnter the key in format 'X-Y' or 'XY' (e.g., '1-2' or '12'):")
        print("B: Back to main menu")
        print("E: Exit program")
        
        key_input = input("Your input: ").strip()
        
        if key_input.upper() == 'E':
            print("\n" + "-" * 80)
            print("Exiting program.")
            exit()
        if key_input.upper() == 'B':
            return
        
        try:
            # Normalize the key
            normalized_key = normalize_path_code(key_input)
            # Validate key format
            path, intensity = normalized_key.split('-')
            int(path)
            int(intensity)
            break
        except:
            print("\n" + "-" * 80)
            print("Invalid key format. Please use format 'X-Y' or 'XY' with numbers.")
    
    # Get the task
    print("\n" + "-" * 80)
    print("Enter the task description:")
    print("B: Back to main menu")
    print("E: Exit program")
    
    task_input = input("Your input: ").strip()
    
    if task_input.upper() == 'E':
        print("\n" + "-" * 80)
        print("Exiting program.")
        exit()
    if task_input.upper() == 'B':
        return
    
    # Get the duration
    print("\n" + "-" * 80)
    print("Enter the duration in minutes (numbers only):")
    print("B: Back to main menu")
    print("E: Exit program")
    
    while True:
        duration_input = input("Your input: ").strip()
        
        if duration_input.upper() == 'E':
            print("\n" + "-" * 80)
            print("Exiting program.")
            exit()
        if duration_input.upper() == 'B':
            return
        
        try:
            duration = int(duration_input)
            break
        except:
            print("Invalid duration. Please enter a number.")
    
    # Create the new quest
    new_quest = {
        "key": normalized_key,
        "task": task_input,
        "duration_minutes": duration
    }
    
    # Display the new quest
    print("\n" + "-" * 80)
    print("New Quest Created:")
    print(f"Key: {new_quest['key']}")
    print(f"Task: {new_quest['task']}")
    print(f"Duration: {new_quest['duration_minutes']} minutes")
    
    # Confirm adding
    print("\n" + "-" * 80)
    print("S: Save this new quest")
    print("B: Cancel and go back")
    print("E: Exit without saving")
    
    save_choice = input("Your choice: ").strip().upper()
    
    if save_choice == 'S':
        quests.append(new_quest)
        with open(os.path.join(os.path.dirname(__file__), 'Quest.json'), 'w', encoding='utf8') as f:
            json.dump(quests, f, indent=2)
        print("\n" + "-" * 80)
        print("New quest saved successfully!")
    elif save_choice == 'E':
        print("\n" + "-" * 80)
        print("Exiting program.")
        exit()
    else:
        print("\n" + "-" * 80)
        print("New quest creation canceled.")

if __name__ == "__main__":
    # First check if Quest.json exists, otherwise generate it
    quests = read_quests()
    edit_quest(quests)