Write-Host "Deleting database and migrations..."
Remove-Item ../SEM5-PI-WEBAPI.db -ErrorAction Ignore
Remove-Item -Recurse -Force ../Migrations -ErrorAction Ignore

Write-Host "Creating initial migration..."
dotnet ef migrations add Initial

Write-Host "Applying migration..."
dotnet ef database update

Write-Host "Database cleaned and recreated successfully!"
