# Ledgerly — Render-ready single bundle

## Render deployment

Repository structure:

    backend/
    frontend/
    docker-compose.yml

In Render create a **Web Service** from this GitHub repository.

Use:

- Environment: Docker
- Dockerfile Path: `./backend/Dockerfile`
- Docker Build Context: repository root (if Render exposes this option, use `.`, otherwise set Dockerfile path to `backend/Dockerfile` and ensure the service builds from the repo root)
- Health/check URL: `/`
- Port: Render's `PORT` (Spring Boot reads `${PORT:8080}`)

The Dockerfile intentionally builds from the repository root because it needs both `backend/` and `frontend/`.

## PostgreSQL

Set:

    DB_URL=jdbc:postgresql://<render-internal-host>:5432/<database>
    DB_USERNAME=<username>
    DB_PASSWORD=<password>

Use Render's **Internal Database URL** when the Web Service and PostgreSQL are on Render in the same region.

## Local Docker build

From the repository root:

    docker build -f backend/Dockerfile -t ledgerly .

Run:

    docker run --rm -p 8080:8080 \
      -e DB_URL=jdbc:postgresql://host.docker.internal:5432/ledgerly \
      -e DB_USERNAME=postgres \
      -e DB_PASSWORD=postgres \
      ledgerly

Open http://localhost:8080

Google Drive and ChatGPT Sites are intentionally excluded.
