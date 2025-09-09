@echo off
set /p REPO_URL="Enter the new GitHub repository URL: "

echo Setting up new repository...
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo Repository setup complete!
echo Your code is now on GitHub at: %REPO_URL%
echo.
echo Next step: Run deploy.cmd to deploy to Vercel
pause
