<#
run_migrations.ps1

Usage:
  # Use PG_CONN environment variable
  powershell -ExecutionPolicy Bypass -File .\scripts\V4_supabase\run_migrations.ps1

  # Or pass connection string as the first argument
  powershell -ExecutionPolicy Bypass -File .\scripts\V4_supabase\run_migrations.ps1 "postgresql://user:pass@host:5432/dbname"

This script requires `psql` to be available in PATH.
#>

param(
    [string]$pgConn = $env:PG_CONN
)

function Fail([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not $pgConn) {
    Fail "No Postgres connection string provided. Set PG_CONN environment variable or pass as first script argument."
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$scripts = @(
    "1_schema.sql",
    "2_helpers.sql",
    "3_triggers.sql",
    # Create any missing application tables (subjects, assignments, teacher_assignments)
    "7_create_subjects.sql",
    "8_create_assignments.sql",
    "6_create_teacher_assignments.sql",
    # Add FK to events.subject_id (guarded)
    "2_add_subject_fk.sql",
    # Rename view columns if needed
    "5_rename_view_columns.sql",
    # Core RLS (original)
    "4_rls_policies.sql",
    # RLS for newly added tables
    "9_rls_new_tables.sql",
    # Add recurring columns to events
    "10_add_events_recurring.sql",
    # Teacher calendar view + policies
    "11_teacher_calendar_view.sql",
    "12_rls_events_teacher.sql",
    # Backfill teacher-class mappings and set safe RLS
    "13_fix_teacher_schedule.sql",
    # Optional seed data
    "5_seed.sql"
)

Write-Host "Using PG_CONN: $pgConn"

foreach ($f in $scripts) {
    $path = Join-Path $root $f
    if (-not (Test-Path $path)) { Fail "Missing migration file: $path" }
    Write-Host "Applying $f..."
    & psql $pgConn -f $path
    if ($LASTEXITCODE -ne 0) { Fail "psql returned exit code $LASTEXITCODE while applying $f" }
}

Write-Host "Core migrations applied.\nNOTE: Do NOT run the events backfill migration (6_migrate_events_target.sql) until your application no longer writes legacy fields.`nIf you are ready to run the migration, uncomment the code below or run it manually."

# To run the backfill/drop migration automatically, uncomment these lines after you are ready:
# $backfill = Join-Path $root "6_migrate_events_target.sql"
# if (Test-Path $backfill) {
#     Write-Host "Applying 6_migrate_events_target.sql..."
#     & psql $pgConn -f $backfill
#     if ($LASTEXITCODE -ne 0) { Fail "psql returned exit code $LASTEXITCODE while applying 6_migrate_events_target.sql" }
#     Write-Host "Backfill migration applied."
# }

Write-Host "All done. Review the MIGRATION_CHECKLIST.md for verification steps."
