FROM python:3.10-slim

WORKDIR /app

# Copiar apenas a pasta backend (que contém o app.py)
COPY backend/ /app/

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Expor a porta
EXPOSE 5000

# Comando para iniciar
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
