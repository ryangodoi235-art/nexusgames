# Usa uma imagem oficial do Python
FROM python:3.10-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala as dependências (ignorando conflitos)
RUN pip install --no-cache-dir --no-deps Flask==2.2.5 flask-cors==4.0.0 gunicorn==20.1.0

# Expõe a porta que o Render usa
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
