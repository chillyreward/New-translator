# restore.ps1 — Restore dictionary files and WAV chunks from Downloads\gikuyu-backup
# Run after git pull: .\scripts\restore.ps1

$backup = "$env:USERPROFILE\Downloads\gikuyu-backup"

if (-not (Test-Path $backup)) {
    Write-Host "ERROR: Backup not found at $backup — run backup.ps1 first"
    exit 1
}

# Restore dictionary files
Copy-Item "$backup\lib\kikuyuPhrases.ts"     "lib\" -Force
Copy-Item "$backup\lib\kikuyuDictionary.ts"  "lib\" -Force
Copy-Item "$backup\lib\kikuyu-dictionary.ts" "lib\" -Force
Copy-Item "$backup\lib\dictionary.ts"        "lib\" -Force

# Restore WAV chunks
Copy-Item "$backup\chunks\*.wav" "public\audio\chunks\" -Force

Write-Host "Restored from: $backup"
Write-Host "Dictionary files restored: 4"
Write-Host "WAV files restored: $(Get-ChildItem "$backup\chunks" | Measure-Object).Count"
