# backup.ps1 — Save dictionary files and WAV chunks to Downloads\gikuyu-backup
# Run before git pull: .\scripts\backup.ps1

$backup = "$env:USERPROFILE\Downloads\gikuyu-backup"
New-Item -ItemType Directory -Force -Path "$backup\lib" | Out-Null
New-Item -ItemType Directory -Force -Path "$backup\chunks" | Out-Null

# Save dictionary files
Copy-Item "lib\kikuyuPhrases.ts"    "$backup\lib\" -Force
Copy-Item "lib\kikuyuDictionary.ts" "$backup\lib\" -Force
Copy-Item "lib\kikuyu-dictionary.ts" "$backup\lib\" -Force
Copy-Item "lib\dictionary.ts"       "$backup\lib\" -Force

# Save all WAV chunks
Copy-Item "public\audio\chunks\*.wav" "$backup\chunks\" -Force

Write-Host "Backup saved to: $backup"
Write-Host "Dictionary files: $(Get-ChildItem "$backup\lib" | Measure-Object).Count"
Write-Host "WAV files: $(Get-ChildItem "$backup\chunks" | Measure-Object).Count"
