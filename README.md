# Swaraj Setu

jSwaraj Setu is an AI-assisted civic complaint platform. Citizens can describe
an issue in plain language, receive a local Ollama classification suggestion,
attach evidence and location data, and support nearby complaints with
upvotes. Department administrators manage tickets through an accountable
workflow.

## Features

- Smart AI and Manual complaint submission modes.
- Local Ollama classification into a primary department, secondary
  departments, urgency and confidence.
- Human review of AI output before ticket creation.
- Browser geolocation and GeoJSON point storage for proximity-based feeds.
- One upvote per authenticated user per complaint.
- Role-protected administrator status changes:
  `Pending -> Assigned -> In Progress -> Resolved`.
- Resolution closure requires proof notes.
- MongoDB geospatial and uniqueness indexes created at startup.
- Five-container Docker Compose deployment with Nginx as the only public
  ingress.

## Architecture

```text
                 host ports 80/443
                        |
                 nginx-gateway
                 /             \
       frontend:3000       backend-django:8000
                                  |
                    +-------------+-------------+
                    |                           |
              mongodb:27017              ollama-nlp:11434

public-net: nginx-gateway only
swaraj-internal-net (internal bridge): all five services
```

The internal services use Docker DNS names and do not publish host ports.
`./nginx/project.conf` is mounted read-only as the active gateway
configuration. Port 443 is exposed for the deployment's TLS termination
point; certificates and production TLS policy must be supplied by the
deployment operator.

## Requirements

- Docker Engine with Compose v2
- At least 8 GB RAM recommended for local Ollama inference
- Internet access during the first build/model download

The default model is `llama3.2`. Set `OLLAMA_MODEL` to another model that is
available to the local Ollama image when necessary.

## Quick start

```bash
export DJANGO_SECRET_KEY='replace-with-a-long-random-value'
export JWT_SECRET='replace-with-a-different-long-random-value'
export MONGO_INITDB_ROOT_PASSWORD='replace-with-a-database-password'

./seed_and_run.sh
```

The script:

1. Builds and starts the five services.
2. Waits for MongoDB.
3. Provisions the configured Ollama model through a temporary outbound Docker
   network, then starts Ollama only on the private internal network.
4. Creates the complaint geospatial and ticket-number indexes.
5. Creates demo users and ten sample complaints when the database is empty.

This temporary provisioning step is required because the runtime network is
deliberately marked `internal: true` and cannot resolve or reach the public
Ollama registry. If the deployment host has no outbound DNS or internet access,
download the model on a connected machine and copy/import the contents of the
`ollama-data` volume before starting the isolated stack.

Open <http://localhost/> after the script completes.

Demo accounts created by the seed script:

| Role          | Email                      | Password    |
| ------------- | -------------------------- | ----------- |
| Citizen       | `citizen@swarajsetu.local` | `demo1234`  |
| Administrator | `admin@swarajsetu.local`   | `admin1234` |

These credentials are for local demonstration only. Change all secrets and
remove the seed accounts before deploying the application.

## Useful commands

```bash
# Start without seeding
docker compose up -d --build

# View service logs
docker compose logs -f backend-django

# Check API and database health
curl http://localhost/api/v1/health/

# Confirm only the gateway has published ports
docker compose ps

# Stop services (named volumes are retained)
docker compose down
```

The Django API is available through the gateway under `/api/v1/`. Important
endpoints include:

- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/signup/`
- `GET /api/v1/auth/profile/`
- `POST /api/v1/complaints/smart-preview/`
- `GET|POST /api/v1/complaints/`
- `GET /api/v1/complaints/feed/`
- `POST /api/v1/complaints/<id>/upvote/`
- `PATCH /api/v1/admin/complaints/<id>/status/`

## Repository layout

```text
backend/             Django REST API, MongoDB access and Ollama client
frontend/            React/Vite citizen and administrator interface
nginx/project.conf   Active reverse-proxy configuration
docker-compose.yml   Five-service, two-network deployment
seed_and_run.sh      Local demo bootstrap and database seeding
```

## Schematic traceability

| Report requirement                 | Repository implementation                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| Dual ingestion and manual override | `SubmitComplaint.tsx`, `ComplaintCreateView`               |
| Local NLP classification           | `ollama_client.py`, `SmartPreviewView`                     |
| Geospatial civic feed              | `ComplaintFeedView`, `db.ensure_indexes`                   |
| One-user upvoting                  | `UpvoteView` atomic `$addToSet` update                     |
| Four-stage ticket lifecycle        | `StatusUpdateView`, `AdminDashboard.tsx`                   |
| Resolution proof                   | `StatusUpdateView` requires non-empty notes for `Resolved` |
| Single public ingress              | `docker-compose.yml`, `nginx/project.conf`                 |

The report's performance targets are verification targets, not guaranteed
values: Ollama inference is targeted below 2.5 seconds and the MongoDB
geospatial query below 100 milliseconds. Measure them on the target hardware
before making production claims.

## Development

Frontend development:

```bash
cd frontend
npm install
npm run dev
```

Backend dependencies are installed by `backend/Dockerfile`. The backend uses
MongoDB through PyMongo rather than Django's relational ORM.

## Security notes

- Do not publish MongoDB, Django or Ollama ports.
- Replace every `change-me-*` default with environment secrets.
- Restrict `DJANGO_ALLOWED_HOSTS` in non-local deployments.
- Put valid TLS certificates and a production TLS configuration behind the
  Nginx 443 listener.
- Treat uploaded media and complaint descriptions as sensitive civic data.

## License

See [LICENSE](./LICENSE).
