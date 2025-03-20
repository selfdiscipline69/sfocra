# Homepage Quest Generation System

This README explains how the homepage generates daily quests and weekly trials based on the user's class selection. The system ensures that quest recommendations align with the user's preferences while maintaining balance and variety.

## Table of Contents
- Overview
- User Classification
- Quest Selection Logic
- Daily Tasks Generation
- Weekly Trial Generation
- Path Diversity System
- Customization and Refreshing

## Overview

The quest generation system on the homepage dynamically selects activities from the Quest.json file based on the user's class, path preference, and difficulty level. The system provides both daily tasks and weekly trials that match the user's preferences while ensuring a balanced approach to personal development.

## User Classification

During onboarding, users answer four classification questions:
1. **Path (P)**: Mind (1), Body (2), or Balanced (3)
2. **Difficulty (D)**: Daily Trials (1) to Spartan Trials (5)
3. **Tracking (T)**: Leveling System (1), Streaks & Habits (2), or Both (3)
4. **Consequence (C)**: Yes Bring It On (1), Choose My Own Punishments (2), or Without Consequence (3)

These answers create a P-D-T-C format key (e.g., "2-3-1-1") that determines the user's class.

## Quest Selection Logic

The homepage uses primarily the first two components of the user's class key to select quests:
- **Path (P)**: Determines the primary type of activities (Mind, Body, or Balanced)
- **Difficulty (D)**: Determines the intensity/duration of activities

Each quest in the Quest.json file has a key in the format `{path}-{intensity}` (e.g., "2-4" for a Body activity at intensity level 4).

## Daily Tasks Generation

The system generates two daily tasks using the following logic:

1. **Difficulty Matching**:
   - Uses the exact difficulty level from the user's profile (1-5)
   - Example: A user with difficulty level 4 gets difficulty-4 activities

2. **Path Diversity**:
   - For users with **Balanced path (3)**:
     - At least 1 task from either Mind (1) or Body (2)
     - At least 1 task from Balanced (3)
   
   - For users with **Mind path (1) or Body path (2)**:
     - At least 1 task from their chosen path
     - At least 1 task from a different path

3. **Fallback Mechanism**:
   - If no tasks match exact difficulty, falls back to any difficulty in the required path
   - If no tasks in required path, provides default tasks

4. **Randomization**:
   - Tasks are shuffled for variety
   - Different tasks are selected each time the user refreshes

## Weekly Trial Generation

The weekly trial consists of 5 quests selected with the following criteria:

1. **Path Distribution**:
   - 1-3 quests from paths other than the user's main path
   - Remaining quests from the user's main path
   - Example: A Body-focused user might get 2 Mind quests and 3 Body quests

2. **Difficulty Selection**:
   - Prefers quests at or above the user's difficulty level
   - Uses higher intensity levels for more challenge

3. **Format**:
   - All 5 quests are presented together in the weekly trial section
   - Duration is shown for each quest but intensity level is hidden
   - Quests are separated by line breaks for readability

4. **Persistence**:
   - Weekly trials don't change when daily tasks are refreshed
   - This allows users to focus on the same weekly goals

## Path Diversity System

The path diversity system ensures a well-rounded approach to personal development:

- **Mind Path**: Activities focused on intellectual and mental development
  - Example activities: Meditation, Reading, Learning
  
- **Body Path**: Activities focused on physical fitness and health
  - Example activities: Working out, Running, Stretching
  
- **Balanced Path**: Activities that combine mental and physical aspects
  - Example activities: Yoga, Mindfulness practice, Walking

Regardless of a user's chosen path, the system ensures exposure to different types of activities, promoting holistic development.

## Customization and Refreshing

- **Daily Tasks**:
  - Refresh automatically when homepage loads
  - Can be manually refreshed with the refresh button
  - Users can edit task text directly in the app
  
- **Weekly Trial**:
  - Persists until explicitly refreshed
  - Not affected by daily task refreshes
  - Provides consistent weekly goals

- **Additional Tasks**:
  - Users can add custom tasks that persist across sessions
  - Custom tasks are stored separately from generated quests

This system ensures users receive appropriate challenges that align with their preferences while maintaining variety and balance across different development paths.