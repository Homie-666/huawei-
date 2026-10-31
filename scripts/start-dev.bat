@echo off
chcp 65001 >nul
title 任务看板 - Vite 服务器
cd /d "%~dp0.."
echo.
echo   任务管理看板 - Vite 开发服务器
echo   ------------------------------------------
echo   访问地址：http://localhost:8085
echo   关闭此窗口即停止服务器
echo   ------------------------------------------
echo.
npx vite --host 0.0.0.0 --port 8085
echo.
echo 服务器已停止，按任意键关闭窗口。
pause >nul
