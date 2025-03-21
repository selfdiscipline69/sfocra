import os
import subprocess
import platform
import json
import argparse

def run_command(command):
    """Execute a shell command and return the output"""
    process = subprocess.Popen(
        command, 
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print(f"Error executing command: {command}")
        print(f"Error: {stderr.decode('utf-8')}")
        return None
    
    return stdout.decode('utf-8')

def clear_android_storage():
    """Clear AsyncStorage for Android using ADB"""
    # Get the app package name
    package_name = "com.yourcompany.myapp"  # Replace with your actual package name
    
    # Check if device is connected
    devices = run_command("adb devices")
    if "device" not in devices:
        print("No Android device connected. Please connect a device and try again.")
        return False
    
    # Get all AsyncStorage keys for this app
    print("Getting AsyncStorage keys...")
    command = f"adb shell run-as {package_name} cat /data/data/{package_name}/files/RCTAsyncLocalStorage_V1/*.json"
    result = run_command(command)
    
    if not result:
        print(f"Could not access AsyncStorage for {package_name}. Is the app installed?")
        return False
    
    # Clear AsyncStorage
    print("Clearing AsyncStorage...")
    clear_command = f"adb shell run-as {package_name} rm -rf /data/data/{package_name}/files/RCTAsyncLocalStorage_V1"
    run_command(clear_command)
    
    print("✅ AsyncStorage cleared successfully on Android")
    return True

def clear_ios_storage(simulator_id=None):
    """Clear AsyncStorage for iOS using simctl"""
    if not simulator_id:
        # List available simulators
        simulators = run_command("xcrun simctl list devices | grep Booted")
        if not simulators:
            print("No iOS simulator running. Please start a simulator and try again.")
            return False
        
        # Extract the first booted simulator ID
        simulator_id = simulators.split("(")[1].split(")")[0]
    
    # Get the app bundle ID
    bundle_id = "com.yourcompany.myapp"  # Replace with your actual bundle ID
    
    # Clear the app's data
    print(f"Clearing data for app {bundle_id} on simulator {simulator_id}...")
    command = f"xcrun simctl reset_data {simulator_id} {bundle_id}"
    result = run_command(command)
    
    if result is None:
        print("Failed to clear app data.")
        return False
    
    print("✅ App data cleared successfully on iOS simulator")
    return True

def main():
    parser = argparse.ArgumentParser(description='Clear React Native AsyncStorage data.')
    parser.add_argument('--platform', choices=['android', 'ios', 'both'], default='both',
                        help='Platform to clear data for (android, ios, or both)')
    args = parser.parse_args()
    
    print("🧹 React Native AsyncStorage Cleaner")
    print("-----------------------------------")
    print("This will clear all user data including:")
    print("- User profile information")
    print("- Login credentials")
    print("- Tasks (daily, weekly, additional)")
    print("- User preferences and app settings")
    print("-----------------------------------")
    
    confirm = input("Are you sure you want to continue? (y/n): ")
    if confirm.lower() != 'y':
        print("Operation cancelled.")
        return
    
    success = False
    
    if args.platform in ['android', 'both']:
        if platform.system() != 'Windows' and platform.system() != 'Linux':
            print("⚠️ Android clearing only supported on Windows and Linux")
        else:
            pass
            #success = clear_android_storage() or success
    
    if args.platform in ['ios', 'both']:
        if platform.system() != 'Darwin':
            print("⚠️ iOS clearing only supported on macOS")
        else:
            success = clear_ios_storage() or success
    
    if success:
        print("\n✅ Cleanup completed successfully!")
        print("You can now restart your app with fresh data.")
    else:
        print("\n⚠️ Cleanup may not have completed successfully.")
        print("Check the error messages above for more information.")

if __name__ == "__main__":
    main()

# How to run the script
# pip install argparse
# python clear-data.py
