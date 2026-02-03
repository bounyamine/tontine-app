@echo off
echo ========================================
echo   Installation Tontine App
echo ========================================
echo.

REM Verifier si Node.js est installe
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Telechargez-le sur: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detecte
node -v
echo.

REM Installer les dependances
echo Installation des dependances...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Installation reussie!
    echo.
    echo ========================================
    echo   Demarrage du serveur...
    echo ========================================
    echo.
    
    REM Demarrer le serveur
    call npm start
) else (
    echo.
    echo [ERREUR] Erreur lors de l'installation
    echo Essayez: npm install --force
    pause
    exit /b 1
)
