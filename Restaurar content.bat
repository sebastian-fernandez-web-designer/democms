@echo off
title Restaurador de Contenido - MODO FORZADO
echo.
echo ========================================================
echo INICIANDO RESTAURACION DE CONTENIDO DE DEMO...
echo =AO-! ESTE PROCESO USA PUSH FORZADO ABSOLUTO !-OA=
echo ========================================================
echo.

:: 1. Descartar cualquier cambio NO COMMITEADO en la carpeta content/ local.
echo 1/3: Descartando cambios locales no commiteados en content/...
:: Esto asegura que la carpeta content/ este en el estado de fabrica de tu ultimo commit local.
git checkout content/
echo Carpeta content/ restaurada a su estado de fabrica.

:: 2. Agregar los cambios (la restauracion) y hacer un commit fresco.
echo.
echo 2/3: Preparando y realizando commit de restauracion...
git add content\
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set fechamensaje=%%c-%%a-%%b
git commit -m "⚙️ [MAINTENANCE] Reset de contenido de demo a estado de fabrica (%fechamensaje%)"

if errorlevel 1 (
    echo AVISO: No se detectaron cambios. Subiendo el estado actual como restauracion.
) else (
    echo Commit realizado con exito.
)

:: 3. Subir los cambios forzando la sobrescritura remota
echo.
echo 3/3: SUBIENDO EL RESET (PUSH FORZADO ABSOLUTO) para activar Rebuild de Netlify...
:: El comando --force sobreescribe el historial remoto, garantizando que tu version gane.
git push origin main --force

if errorlevel 1 (
    echo.
    echo ERROR: El PUSH FORZADO fallo. Contacta a un administrador de Git.
    echo.
) else (
    echo PUSH FORZADO COMPLETO. Netlify iniciara el Rebuild.
)

echo.
echo ========================================================
echo RESTAURACION FINALIZADA.
echo ========================================================
pause