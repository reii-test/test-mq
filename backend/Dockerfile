FROM python:3.12-slim

WORKDIR /app

RUN pip install pdm --break-system-packages

COPY pyproject.toml pdm.lock ./
RUN pdm install --prod --no-self

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "pdm run migrate && pdm run python manage.py seed && pdm run dev"]
