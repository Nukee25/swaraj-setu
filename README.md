# Swaraj Setu

Swaraj Setu is a containerized civic grievance platform with an Ollama-powered classifier, MongoDB geospatial complaint feed, JWT authentication, and a municipal admin workflow.

## Run locally

```bash
./seed_and_run.sh
```

The script builds the five services, downloads the configured Ollama model, creates the MongoDB geospatial indexes, and seeds ten Delhi/NCR complaints. The gateway is available at `http://localhost/`.

Demo accounts after seeding:

- Citizen: `citizen@swarajsetu.local` / `demo1234`
- Admin: `admin@swarajsetu.local` / `admin1234`

Only the Nginx gateway publishes host ports. MongoDB, Django, frontend, and Ollama communicate through the private `swaraj-internal-net`.
