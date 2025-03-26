# How to run: python assets\generate_quests.py --generate --variations 3
# This will generate a Quest.json file with 3 variations for each path-intensity combination
# The Quest.json file will be saved in the assets folder

import json
import os
import copy
import random
import argparse

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

def load_task_library():
    """Load the task library from JSON file"""
    try:
        with open('assets/TaskLibrary.json', 'r', encoding='utf8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: TaskLibrary.json not found in assets directory")
        exit(1)
    except json.JSONDecodeError:
        print("Error: TaskLibrary.json is not valid JSON")
        exit(1)

def generate_weekly_plan(path, intensity, week_number, task_library):
    """Generate a 7-day plan with appropriate tasks for the path and intensity"""
    # Define appropriate tasks for each path
    path_tasks = {
        "mental": ["meditation", "journaling", "book-reading", "podcast", "chill-music", 
                  "self-reflection", "creative-training", "article-reading", "skill-dev",
                  "documentary", "cooking", "social-talk", "hobby-discovery"],
        "physical": ["walking", "bodyweight", "stretching", "yoga", "jogging", 
                    "rhythmic-movement", "recovery", "good-sleep", "outdoor-cardio",
                    "gym-workout", "running"],
        "balanced": ["meditation", "walking", "journaling", "bodyweight", "book-reading",
                    "yoga", "stretching", "creative-training", "recovery", "podcast",
                    "self-reflection", "jogging", "article-reading", "skill-dev"]
    }
    
    # Define weekly themes based on week number
    weekly_themes = {
        "mental": {
            1: "Foundation in mindfulness with meditation and journaling",
            2: "Expanding learning with reading and skill development",
            3: "Creative expression and social connection", 
            4: "Integrating all mental practices into a sustainable routine"
        },
        "physical": {
            1: "Building a foundation of basic movements",
            2: "Increasing endurance with longer activities",
            3: "Adding variety to your physical routine",
            4: "Creating a balanced and sustainable exercise plan"
        },
        "balanced": {
            1: "Establishing basic mental and physical practices",
            2: "Balancing mind and body with consistent practice",
            3: "Integrating wellness into daily life",
            4: "Creating a sustainable holistic routine"
        }
    }
    
    # Filter tasks for this path and check if they exist in task_library with the current intensity
    available_tasks = []
    for task in path_tasks[path]:
        # Check if task exists and has the current intensity level
        if (task in task_library and 
            str(intensity) in task_library[task]["intensities"]):
            available_tasks.append(task)
    
    if len(available_tasks) < 2:
        print(f"Warning: Not enough tasks available for {path} at intensity {intensity}")
        # Fallback to using any tasks that are available
        available_tasks = [task for task in task_library 
                          if str(intensity) in task_library[task]["intensities"]]
    
    # Create 7 days of paired tasks
    daily_tasks = []
    used_task_pairs = set()  # Track task pairs to avoid exact duplicates
    used_tasks_consecutive_days = []  # Track last day's tasks to avoid consecutive repetition
    
    for day in range(1, 8):
        # Keep trying until we get a suitable pair
        max_attempts = 20  # Prevent infinite loops
        attempts = 0
        
        while attempts < max_attempts:
            attempts += 1
            
            # Select two different tasks for this day
            candidate_tasks = [t for t in available_tasks if t not in used_tasks_consecutive_days]
            
            # If we can't avoid consecutive repetition, use all available tasks
            if len(candidate_tasks) < 2:
                candidate_tasks = available_tasks
            
            # If still not enough tasks, show error and use what we have
            if len(candidate_tasks) < 2:
                print(f"Error: Not enough unique tasks for {path} path, intensity {intensity}, day {day}")
                if len(available_tasks) >= 2:
                    day_tasks = random.sample(available_tasks, 2)
                else:
                    # Extreme fallback - just use the first task twice if we have at least one
                    task = available_tasks[0] if available_tasks else "meditation"
                    day_tasks = [task, task]
                break
            
            day_tasks = random.sample(candidate_tasks, 2)
            day_tasks.sort()  # Sort to make comparison consistent
            task_pair = tuple(day_tasks)
            
            # Avoid using the same pair of tasks twice
            if task_pair not in used_task_pairs:
                used_task_pairs.add(task_pair)
                break
        
        # Format task IDs with intensity
        task_ids = [f"{task}-{intensity}" for task in day_tasks]
        
        # Update tracking for consecutive days
        used_tasks_consecutive_days = day_tasks
        
        daily_tasks.append({
            "dayNumber": day,
            "tasks": task_ids
        })
    
    # Create the weekly plan
    return {
        "weekNumber": week_number,
        "weeklyTrial": weekly_themes[path][week_number],
        "days": daily_tasks
    }

def generate_challenge(path, intensity, task_library):
    """Generate a complete 4-week challenge for a path and intensity"""
    # Path code mapping
    path_codes = {
        "mental": "1",
        "physical": "2", 
        "balanced": "3"
    }
    
    titles = {
        "mental": {
            1: "Mental Wellness Beginner",
            2: "Mental Wellness Easy",
            3: "Mental Wellness Intermediate",
            4: "Mental Wellness Advanced",
            5: "Mental Wellness Expert"
        },
        "physical": {
            1: "Physical Wellness Beginner",
            2: "Physical Wellness Easy",
            3: "Physical Wellness Intermediate",
            4: "Physical Wellness Advanced",
            5: "Physical Wellness Expert"
        },
        "balanced": {
            1: "Balanced Wellness Beginner",
            2: "Balanced Wellness Easy",
            3: "Balanced Wellness Intermediate",
            4: "Balanced Wellness Advanced",
            5: "Balanced Wellness Expert"
        }
    }
    
    descriptions = {
        "mental": {
            1: "Start your mental wellness journey with basic mindfulness, learning, and creativity activities",
            2: "Build upon your mental wellness foundation with slightly more challenging activities",
            3: "Develop a consistent mental wellness practice with medium-intensity activities",
            4: "Challenge yourself with advanced mental wellness practices",
            5: "Master intensive mental wellness techniques for long-term growth"
        },
        "physical": {
            1: "Start your physical wellness journey with gentle exercise and movement",
            2: "Build upon your physical foundation with slightly more challenging activities",
            3: "Develop consistent fitness habits with medium-intensity exercises",
            4: "Challenge yourself with advanced physical training",
            5: "Master intensive physical training for peak performance"
        },
        "balanced": {
            1: "Develop a holistic approach to wellness with a balance of mental and physical activities",
            2: "Build a more consistent wellness routine with slightly more challenging activities",
            3: "Integrate medium-intensity activities into a balanced wellness practice",
            4: "Challenge yourself with advanced mental and physical techniques",
            5: "Master intensive wellness practices for optimal mind-body health"
        }
    }
    
    # Generate 4 weeks of plans
    weeks = []
    for week in range(1, 5):
        weeks.append(generate_weekly_plan(path, intensity, week, task_library))
    
    # Create the complete challenge with new ID format
    return {
        "id": f"{path_codes[path]}-{intensity}", # Use path_codes instead of path name
        "path": path,
        "intensity": intensity,
        "title": titles[path][intensity],
        "description": descriptions[path][intensity],
        "weeks": weeks
    }

def generate_quest_json(num_variations=1):
    """Generate a complete Quest.json file with challenges at different intensity levels"""
    # Load the task library
    task_library = load_task_library()
    
    # Create quests structure
    quests = {
        "progressiveChallenges": [],
        "taskLibrary": {}
    }
    
    # Generate challenges for each path and intensity combination
    paths = ["mental", "physical", "balanced"]
    intensities = [1, 2, 3, 4, 5]
    
    for path in paths:
        for intensity in intensities:
            for variation in range(1, num_variations + 1):
                challenge = generate_challenge(path, intensity, task_library)
                
                # Add variation suffix if multiple variations
                if num_variations > 1:
                    challenge["id"] = f"{challenge['id']}-{variation}"  # Just add the number
                    challenge["title"] = f"{challenge['title']} ({variation})"  # No "Variation" text
                
                quests["progressiveChallenges"].append(challenge)
                print(f"Generated: {challenge['title']}")
    
    # Prepare the task library for the output file
    for task_id, task_info in task_library.items():
        for intensity in intensities:
            intensity_key = str(intensity)
            if intensity_key in task_info["intensities"]:
                full_task_id = f"{task_id}-{intensity}"
                quests["taskLibrary"][full_task_id] = {
                    "task": task_info["task"],
                    "duration": task_info["intensities"][intensity_key]["duration"],
                    "category": task_info["category"]
                }
    
    # Write to Quest.json
    quest_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Quest.json')
    with open(quest_json_path, 'w', encoding='utf8') as f:
        json.dump(quests, f, indent=2)
    
    print(f"Successfully generated Quest.json with {len(quests['progressiveChallenges'])} challenges")
    print(f"File saved to: {quest_json_path}")
    
    return quests

def read_quests():
    """Read existing Quest.json file or generate a new one"""
    quest_json_path = os.path.join(os.path.dirname(__file__), 'Quest.json')
    if (os.path.exists(quest_json_path)):
        try:
            with open(quest_json_path, 'r', encoding='utf8') as f:
                quests = json.load(f)
            print(f"Loaded existing Quest.json with {len(quests['progressiveChallenges'])} challenges")
            return quests
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error reading Quest.json: {e}")
            print("Generating new quests...")
            return generate_quest_json()
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
    print(f"ID: {quest['id']}")
    print(f"Title: {quest['title']}")
    print(f"Description: {quest['description']}")
    print("-" * 80)

def edit_quest(quests):
    """Interactive function to edit the quests"""
    while True:
        print("\n" + "-" * 80)
        print("Quest Generation Utility")
        print("-" * 80)
        print("E: Exit program")
        print("R: Read and edit quests")
        print("G: Generate new Quest.json")
        print("V: Generate multiple variations")
        action = input("Enter your choice (E/R/G/V): ").strip().upper()
        
        if action == 'E':
            print("\nExiting program.")
            break
            
        elif action == 'G':
            print("\nGenerating new Quest.json with default settings...")
            
            # Get the absolute path for Quest.json
            quest_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Quest.json')
            print(f"Quest.json will be saved to: {quest_json_path}")
            
            # First ensure the old file is deleted if it exists
            try:
                if (os.path.exists(quest_json_path)):
                    # Force file close in case it's being held open
                    import gc
                    gc.collect()  # Run garbage collection to close any lingering file handles
                    
                    # Try to remove the file
                    os.remove(quest_json_path)
                    print(f"Old Quest.json file removed successfully from: {quest_json_path}")
            except Exception as e:
                print(f"Warning: Could not remove old file: {e}")
            
            # Generate new quests
            quests = generate_quest_json()
            
            # Verify the file exists with the correct content
            if os.path.exists(quest_json_path):
                file_size = os.path.getsize(quest_json_path)
                print(f"Verified: New Quest.json file created with size {file_size} bytes.")
            else:
                print("Warning: Failed to create new Quest.json file.")
                
        elif action == 'V':
            try:
                num_variations = int(input("Enter number of variations for each path-intensity combination: ").strip())
                if num_variations < 1:
                    print("Number of variations must be at least 1. Using default of 1.")
                    num_variations = 1
                elif num_variations > 10:
                    confirm = input(f"Warning: Generating {num_variations} variations will create a very large file. Continue? (y/n): ").strip().lower()
                    if confirm != 'y':
                        print("Operation cancelled.")
                        continue
                
                print(f"\nGenerating Quest.json with {num_variations} variations per path-intensity...")
                quests = generate_quest_json(num_variations)
                
            except ValueError:
                print("Invalid input. Please enter a number.")
                
        elif action == 'R':
            # First, show available paths to help the user
            print("\nAvailable paths:")
            if 'progressiveChallenges' in quests:
                unique_paths = sorted(set(q['id'] for q in quests['progressiveChallenges']))
                for i, path in enumerate(unique_paths):
                    print(f"{i+1}. {path}")
            else:
                print("No paths available. Please generate quests first.")
                continue
            
            print("\n" + "-" * 80)
            print("Instructions for path selection:")
            print("Enter a path code like '1-2' (path 1, intensity 2)")
            print("You can also enter '12' which will be converted to '1-2'")
            print("A: Show all quests")
            print("B: Back to main menu")
            print("E: Exit program")
            
            path_to_code = input("\nEnter the path-to-code key: ").strip()
            if (path_to_code.upper() == 'E'):
                print("\nExiting program.")
                return
            if path_to_code.upper() == 'B':
                continue
            if path_to_code.upper() == 'A':
                print("\nShowing all quests:")
                print("-" * 80)
                for idx, quest in enumerate(quests['progressiveChallenges']):
                    print(f"Quest {idx}: ID: {quest['id']} | Title: {quest['title']}")
                print("-" * 80)
                input("Press Enter to continue...")
                continue
            
            # Normalize path code to handle both "12" and "1-2" formats
            normalized_path = normalize_path_code(path_to_code)
            print(f"\nLooking for quests with path '{normalized_path}'...")
            
            filtered_quests = [q for q in quests['progressiveChallenges'] if q['id'] == normalized_path]
            
            if not filtered_quests:
                print(f"\nNo quests found with path '{normalized_path}'. Please try again.")
                continue
            
            print(f"\nFound {len(filtered_quests)} quests matching path '{normalized_path}':")
            print("-" * 80)
            for idx, quest in enumerate(filtered_quests):
                print(f"Index: {idx} | ID: {quest['id']} | Title: {quest['title']}")
            print("-" * 80)
            
            # Display details of the first quest for reference
            display_quest_info(filtered_quests[0])
            
            # Show weekly plan structure for the first quest
            if len(filtered_quests) > 0 and 'weeks' in filtered_quests[0]:
                print("\nWeekly Plans Preview:")
                for week in filtered_quests[0]['weeks']:
                    print(f"Week {week['weekNumber']}: {week['weeklyTrial']}")
                    for i, day in enumerate(week['days']):
                        if i < 2:  # Just show first two days for brevity
                            tasks = ", ".join(day['tasks'])
                            print(f"  Day {day['dayNumber']}: {tasks}")
                    if len(week['days']) > 2:
                        print("  ...")
                print("-" * 80)
            
            print("\nOptions:")
            print("Enter a number to see more details about that quest")
            print("B: Back to path selection")
            print("E: Exit program")
            
            option = input("Your choice: ").strip()
            
            if option.upper() == 'E':
                print("\nExiting program.")
                return
            if option.upper() == 'B':
                continue
                
            try:
                idx = int(option)
                if 0 <= idx < len(filtered_quests):
                    quest = filtered_quests[idx]
                    display_quest_info(quest)
                    
                    # Show each week's plan
                    if 'weeks' in quest:
                        print("\nWeeks:")
                        for week in quest['weeks']:
                            print(f"\nWeek {week['weekNumber']}: {week['weeklyTrial']}")
                            for day in week['days']:
                                # Lookup task details from taskLibrary
                                task_details = []
                                for task_id in day['tasks']:
                                    if task_id in quests['taskLibrary']:
                                        task_info = quests['taskLibrary'][task_id]
                                        task_details.append(f"{task_info['task']} ({task_info['duration']})")
                                    else:
                                        task_details.append(task_id)
                                
                                tasks_str = ", ".join(task_details)
                                print(f"  Day {day['dayNumber']}: {tasks_str}")
                    
                    input("\nPress Enter to continue...")
                else:
                    print("Invalid index. Please enter a number within the range shown.")
            except ValueError:
                print("Invalid input. Please enter a numeric value.")
                
        else:
            print("\nInvalid option. Please enter E, R, G, or V.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate Quest.json with progressive challenges')
    parser.add_argument('--variations', '-v', type=int, default=1, 
                        help='Number of variations to generate for each path-intensity combination')
    parser.add_argument('--generate', '-g', action='store_true',
                        help='Generate new Quest.json file without interactive mode')
    parser.add_argument('--interactive', '-i', action='store_true',
                        help='Run in interactive mode')
    
    args = parser.parse_args()
    
    if args.generate:
        generate_quest_json(num_variations=args.variations)
    elif args.interactive:
        quests = read_quests()
        edit_quest(quests)
    else:
        # By default, run in interactive mode
        quests = read_quests()
        edit_quest(quests)