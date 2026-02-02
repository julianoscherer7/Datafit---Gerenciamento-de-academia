@echo off
set PYTHONIOENCODING=utf-8
echo Iniciando Backend Datafit...
cd backend
call venv\Scripts\activate.bat
echo Verificando banco de dados...
python seed.py
echo Iniciando servidor...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
