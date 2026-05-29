FROM python:3.9-slim

WORKDIR /app

# Copiar apenas o necessário
COPY requirements.txt .
COPY app.py .
COPY *.html .
COPY *.js .
COPY *.css .
COPY images/ ./images/

# Instalar sem resolver dependências
RUN pip install --no-cache-dir --no-deps Flask==2.0.3 flask-cors==3.0.10 psycopg2-binary==2.9.3 gunicorn==20.1.0

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
