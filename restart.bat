@echo off
echo ========================================
echo    Reinicio rapido - La Colmena
echo ========================================
echo.

echo [1/4] Deteniendo servidores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Limpiando cache...
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite" >nul 2>&1

echo [3/4] Verificando puertos...
netstat -ano | findstr :3001 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ⚠️  Puerto 3001 ocupado, matando proceso...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
)

netstat -ano | findstr :3502 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ⚠️  Puerto 3502 ocupado, matando proceso...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3502 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
)

echo [4/4] Iniciando servidores...
echo.
echo ✓ Backend:  http://localhost:3001
echo ✓ Frontend: http://localhost:3502
echo.
echo Presiona Ctrl+C para detener
echo.

npm run dev

