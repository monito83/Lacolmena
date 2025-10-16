@echo off
echo ========================================
echo    LIMPIEZA ULTRA - La Colmena
echo ========================================
echo.

echo [1/10] Matando TODOS los procesos de Node.js...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM vite.exe >nul 2>&1
taskkill /F /IM tsx.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1
taskkill /F /IM concurrently.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
echo ✓ Procesos terminados

echo.
echo [2/10] Esperando 10 segundos...
timeout /t 10 /nobreak >nul

echo.
echo [3/10] Matando procesos por puerto específico...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Matando proceso en puerto 3001: %%a
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3502 ^| findstr LISTENING') do (
    echo Matando proceso en puerto 3502: %%a
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4002 ^| findstr LISTENING') do (
    echo Matando proceso en puerto 4002: %%a
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Matando proceso en puerto 5000: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [4/10] Limpiando cache completo...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite" >nul 2>&1
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache" >nul 2>&1
if exist "frontend\dist" rmdir /s /q "frontend\dist" >nul 2>&1
if exist "frontend\.vite" rmdir /s /q "frontend\.vite" >nul 2>&1
echo ✓ Cache limpiado

echo.
echo [5/10] Verificando puertos libres...
echo Puerto 3001:
netstat -ano | findstr :3001
echo Puerto 5000:
netstat -ano | findstr :5000

echo.
echo [6/10] Esperando 5 segundos más...
timeout /t 5 /nobreak >nul

echo.
echo [7/10] Reinstalando dependencias del frontend...
cd frontend
npm install >nul 2>&1
cd ..

echo.
echo [8/10] Reinstalando dependencias del backend...
cd backend
npm install >nul 2>&1
cd ..

echo.
echo [9/10] Verificando configuración...
echo Frontend configurado para puerto: 5000
echo Backend configurado para puerto: 3001

echo.
echo [10/10] Iniciando servidores...
echo.
echo ========================================
echo    Servidores iniciando...
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:5000
echo ========================================
echo.

npm run dev

echo.
echo ========================================
echo    Servidores detenidos
echo ========================================
pause

