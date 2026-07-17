@echo off
setlocal
cd /d "%~dp0"

echo Iniciando a previa do CLONE em http://localhost:4180/
echo.

npm.cmd run preview:restart
if errorlevel 1 (
  echo.
  echo Nao consegui iniciar a previa. Veja a mensagem acima.
  pause
  exit /b 1
)

start "" "http://localhost:4180/"
echo.
echo Pronto. Se a pagina nao abrir sozinha, acesse:
echo http://localhost:4180/
echo.
pause
