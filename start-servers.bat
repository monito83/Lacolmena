@echo off
echo ========================================
echo    Sistema de Gestion La Colmena
echo    Script de inicio de servidores
echo ========================================
echo.

echo [1/6] Matando procesos de Node.js existentes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM vite.exe >nul 2>&1
echo ✓ Procesos terminados

echo.
echo [2/6] Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo [3/6] Verificando puertos...
echo Puerto 3001 (Backend):
netstat -ano | findstr :3001
echo Puerto 3502 (Frontend):
netstat -ano | findstr :3502

echo.
echo [4/6] Limpiando cache de Node...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
if exist "frontend\node_modules\.vite" rmdir /s /q "frontend\node_modules\.vite" >nul 2>&1
echo ✓ Cache limpiado

echo.
echo [5/6] Iniciando servidores...
echo ✓ Ejecutando: npm run dev
echo.
echo ========================================
echo    Servidores iniciando...
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:3502
echo ========================================
echo.
echo Presiona Ctrl+C para detener los servidores
echo.

npm run dev

echo.
echo ========================================
echo    Servidores detenidos
echo ========================================
pause
