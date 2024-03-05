#!/bin/bash

# Define the application executable name and its current location
appName="filebase"
currentAppPath="$appName"

# Function to check if a path is in the PATH environment variable
function isInPath() {
    echo ":$PATH:" | grep -Fq ":$1:"
}

# Determine the installation path based on what's available in PATH
if isInPath "/usr/local/bin"; then
    installPath="/usr/local/bin"
elif isInPath "/usr/bin"; then
    installPath="/usr/bin"
elif isInPath "/bin"; then
    installPath="/bin"
else
    echo "Error: None of the preferred installation paths are in your PATH."
    exit 1
fi

# Copy the application executable to the target directory
sudo cp "$currentAppPath" "$installPath/$appName"

# Make sure the executable has execution permissions
sudo chmod +x "$installPath/$appName"

echo "Installation complete. You can now run $appName from the terminal."
