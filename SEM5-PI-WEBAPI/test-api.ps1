$ProgressPreference = 'SilentlyContinue'

$URLs = @(
    "http://10.9.21.87:5008"
    "http://10.9.23.188:5008"
    "http://10.9.23.173:5008"
    "http://localhost:5008"
)

$Endpoint = "/api/StaffMembers"
$HttpDir = "./http"

Write-Host "Testing API endpoints..." -ForegroundColor Cyan

foreach ($URL in $URLs) {
    $fullUrl = "$URL$Endpoint"

    # Faz a requisição e captura o status code de forma determinística
    $statusCode = $null
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -TimeoutSec 3 -ErrorAction Stop
        $statusCode = [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            try { $statusCode = [int]$_.Exception.Response.StatusCode.Value__ } catch { $statusCode = $null }
        } else {
            $statusCode = $null
        }
    }

    $ok = ($statusCode -eq 200 -or $statusCode -eq 404)

    if ($ok) {
        Write-Host ("Trying {0} ... ✓ Connected! (HTTP {1})" -f $fullUrl, $statusCode) -ForegroundColor Green
        $workingUrl = $URL
        Write-Host "Use this URL: $workingUrl" -ForegroundColor Yellow

        if (Test-Path $HttpDir) {
            Write-Host "Updating .http files in $HttpDir..." -ForegroundColor Cyan

            Get-ChildItem -Path $HttpDir -Filter *.http | ForEach-Object {
                $file = $_.FullName
                $content = Get-Content $file

                if ($content -match "^@portURL") {
                    $newContent = $content -replace "^@portURL.*", "@portURL = $workingUrl"
                    $newContent | Set-Content $file
                    Write-Host ("  ✓ Updated: {0}" -f $_.Name) -ForegroundColor Green
                } else {
                    "@portURL = $workingUrl" | Set-Content $file
                    Add-Content $file $content
                    Write-Host ("  ✓ Added to: {0}" -f $_.Name) -ForegroundColor Green
                }
            }

            Write-Host "All .http files updated successfully!" -ForegroundColor Cyan
        } else {
            Write-Host "Warning: Directory $HttpDir not found!" -ForegroundColor Red
        }

        exit 0
    } else {
        $codeShown = $(if ($statusCode) { " (HTTP $statusCode)" } else { "" })
        Write-Host ("Trying {0} ... ✗ Failed{1}" -f $fullUrl, $codeShown) -ForegroundColor Red
    }
}

Write-Host "No working endpoint found!" -ForegroundColor Red
exit 1
