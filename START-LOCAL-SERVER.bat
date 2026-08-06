@echo off
title Kredibility Finance — Local Server
echo.
echo  =========================================
echo   Kredibility Finance — Local Web Server
echo  =========================================
echo.
echo  Once running, open: http://localhost:8000
echo  Press Ctrl+C to stop.
echo.

set PORT=8000
set DIR=%~dp0

:: Try Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Starting with Python...
    start "" "http://localhost:%PORT%/apply.html"
    python -m http.server %PORT% --directory "%DIR%"
    goto end
)

:: Try py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Starting with Python (py)...
    start "" "http://localhost:%PORT%/apply.html"
    py -m http.server %PORT% --directory "%DIR%"
    goto end
)

:: Try Node npx serve
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Starting with Node.js...
    start "" "http://localhost:%PORT%/apply.html"
    npx serve "%DIR%" -l %PORT%
    goto end
)

:: Fallback: PowerShell built-in HTTP server (works on ALL Windows 10/11)
echo  Starting with PowerShell (built-in)...
start "" "http://localhost:%PORT%/apply.html"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=%PORT%; $root='%DIR:\=\\%'; $listener=New-Object Net.HttpListener; $listener.Prefixes.Add(\"http://localhost:$port/\"); $listener.Start(); Write-Host ' Server running. Press Ctrl+C to stop.' -ForegroundColor Green; while($listener.IsListening){ $ctx=$listener.GetContext(); $req=$ctx.Request; $res=$ctx.Response; $local=$req.Url.LocalPath.TrimStart('/'); if($local -eq ''){{$local='index.html'}}; $file=Join-Path $root $local; if(Test-Path $file -PathType Leaf){ $bytes=[IO.File]::ReadAllBytes($file); $ext=[IO.Path]::GetExtension($file); $mime=switch($ext){{ '.html'{'text/html'}; '.css'{'text/css'}; '.js'{'application/javascript'}; '.png'{'image/png'}; '.jpg'{'image/jpeg'}; '.jpeg'{'image/jpeg'}; '.webp'{'image/webp'}; '.svg'{'image/svg+xml'}; default{'application/octet-stream'} }}; $res.ContentType=$mime; $res.ContentLength64=$bytes.Length; $res.OutputStream.Write($bytes,0,$bytes.Length) }else{ $res.StatusCode=404 }; $res.Close() }"

:end
echo.
echo  Server stopped.
pause
