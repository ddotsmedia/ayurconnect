$ErrorActionPreference = "Stop"

Write-Host "Starting AyurConnect dev infra (postgres, redis, meilisearch, minio)..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Waiting for postgres to be healthy..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
    $status = docker inspect -f '{{.State.Health.Status}}' ayurconnect-postgres 2>$null
    if ($status -eq "healthy") {
        Write-Host "postgres: healthy" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
}

Write-Host "Service status:" -ForegroundColor Cyan
docker compose ps
