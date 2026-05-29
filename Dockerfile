FROM python:3.10-slim

WORKDIR /app

# Copia apenas o necessário
COPY . .

# Instala os pacotes sem verificar dependências
RUN pip install --no-cache-dir --no-deps Flask gunicorn

# Expõe a porta
EXPOSE 5000

# Comando para iniciar
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
