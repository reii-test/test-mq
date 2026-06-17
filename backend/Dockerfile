FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml pdm.lock ./
RUN pip install pdm --break-system-packages && \
    pdm export --no-hashes -o requirements.txt && \
    pip install -r requirements.txt --break-system-packages

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py seed && python manage.py runserver 0.0.0.0:8000"]
