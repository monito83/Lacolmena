@echo off
echo ========================================
echo    Deteniendo servidores La Colmena
echo ========================================
echo.

echo [1/3] Matando procesos de Node.js...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM vite.exe >nul 2>&1
echo ✓ Procesos terminados

echo.
echo [2/3] Verificando puertos libres...
echo Puerto 3001:
netstat -ano | findstr :3001
echo Puerto 3502:
netstat -ano | findstr :3502

echo.
echo [3/3] Limpiando procesos zombie...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3502') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ========================================
echo    Servidores detenidos correctamente
echo ========================================
echo.
echo Puertos finales:
netstat -ano | findstr :3001
netstat -ano | findstr :3502
echo.
pause

