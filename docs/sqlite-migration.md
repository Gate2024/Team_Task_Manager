# Importing the legacy SQLite data

The PostgreSQL schema must already be upgraded to the latest Alembic revision.
The importer preserves legacy numeric IDs, lowercases emails, converts task
statuses, and ensures every project creator has an `owner` membership.

The script is idempotent for the same legacy source: rows are upserted and the
membership uniqueness constraint prevents duplicates.

## Safety rule

Never pass `instance/site.db` directly. The importer opens its source read-only
and refuses the repository's original database path (including a hard link),
but the operator must still create a normal file copy.

PowerShell example from the repository root:

```powershell
$copyDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "task-manager-import") -Force
$copyPath = Join-Path $copyDir "site-copy.db"
Copy-Item -LiteralPath "instance\site.db" -Destination $copyPath

$env:APP_ENV = "development"
$env:SECRET_KEY = "replace-with-a-real-secret"
$env:JWT_SECRET_KEY = "replace-with-another-real-secret"
$env:DATABASE_URL = "postgresql+psycopg://task_manager:task_manager@localhost:55432/task_manager"

& ".\venv\Scripts\python.exe" "backend\scripts\import_sqlite.py" --source $copyPath
```

Run the same command a second time and verify that the PostgreSQL row counts do
not increase. The script prints source, pre-import, and post-import counts plus
the status conversions and number of repaired owner memberships.
