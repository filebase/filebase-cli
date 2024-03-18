# Define the application executable name and its current location
$appName = "filebase.exe"
$currentAppPath = "$appName"

# Define the target installation directory in Program Files
$installPath = Join-Path -Path $Env:ProgramFiles -ChildPath "filebase"

# Create the target directory if it doesn't exist
if (-not (Test-Path -Path $installPath)) {
    New-Item -ItemType Directory -Path $installPath | Out-Null
}

# Copy the application executable to the target directory
Copy-Item -Path $currentAppPath -Destination $installPath

# Add the application's directory to the system PATH environment variable
# This allows the application to be run from anywhere in the terminal
$systemPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
if (-not ($systemPath.Split(';') -contains $installPath)) {
    $newPath = $systemPath + ";" + $installPath
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::Machine)
}

Write-Output "Installation and configuration complete. You can now run $appName from the terminal."
