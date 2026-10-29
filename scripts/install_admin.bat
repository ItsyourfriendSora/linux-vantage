@echo off
echo ========================================================
echo Installing Nexora Thermal Helper with Permanent Admin Permissions
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0setup_helper.ps1\"'"
echo.
echo Setup completed! You will no longer be asked for administrator permission when switching thermal modes.
pause
