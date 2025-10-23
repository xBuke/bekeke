@echo off
echo 🚀 Setting up Supabase Auth for Production...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if access token is set
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo ❌ SUPABASE_ACCESS_TOKEN environment variable is not set
    echo.
    echo Get your access token from: https://supabase.com/dashboard/account/tokens
    echo.
    echo To set the token, run:
    echo set SUPABASE_ACCESS_TOKEN=your-token-here
    echo.
    pause
    exit /b 1
)

echo 📋 Project: uebidzpkptdmcnqjaody
echo 🌐 Site URL: https://uslugo.vercel.app
echo 🔄 Redirect URLs: https://uslugo.vercel.app/auth/callback, http://localhost:3000/auth/callback
echo.

REM Run the configuration script
node configure-supabase-auth.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Configuration failed. Please check the error above.
    pause
    exit /b 1
)

echo.
echo ✅ Production auth configuration complete!
echo 🔗 Your site should now work with password reset flow.
echo.
pause
