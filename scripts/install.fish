#!/usr/bin/env fish

# Define the application executable name and its current location
set appName "filebase"
set currentAppPath "../$appName"

# Function to check if a path is in the PATH environment variable
function isInPath
    echo ":$PATH:" | grep -Fq ":$argv[1]:"
end

# Determine the installation path based on what's available in PATH
if isInPath "/usr/local/bin"
    set installPath "/usr/local/bin"
else if isInPath "/usr/bin"
    set installPath "/usr/bin"
else if isInPath "/bin"
    set installPath "/bin"
else
    echo "Error: None of the preferred installation paths are in your PATH."
    exit 1
end

# Copy the application executable to the target directory
sudo cp "$currentAppPath" "$installPath/$appName"

# Make sure the executable has execution permissions
sudo chmod +x "$installPath/$appName"

# Setup Autocompletion
echo 'filebase --completion-fish | source' >> ~/.config/fish/config.fish

echo "Installation complete. You can now run $appName from the terminal."
