@echo off
echo Setting up Orrya Contact Backend with MySQL...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL command not found. Make sure MySQL is installed and added to PATH.
    echo You can download MySQL from https://dev.mysql.com/downloads/mysql/
    echo.
)

echo Installing Node.js dependencies...
npm install

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Make sure MySQL server is running
echo 2. Copy .env.example to .env and configure your database settings
echo 3. Run 'npm start' to start the server
echo 4. Open admin.html in your browser to view contact submissions
echo.
pause
