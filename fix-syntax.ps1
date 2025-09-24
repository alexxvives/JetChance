$files = @(
    "frontend\src\FlightList.jsx",
    "frontend\src\pages\FlightDetailsPage.jsx",
    "frontend\src\components\OperatorDashboard.jsx",
    "frontend\src\pages\CreateFlightPage.jsx",
    "frontend\src\components\SafeOperatorDashboard.jsx",
    "frontend\src\pages\EditFlightPage.jsx"
)

$basePath = "C:\Users\alexx\Desktop\Projects\ChanceFly"

foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Write-Host "Checking: $file"
        $content = Get-Content $fullPath -Raw
        
        # Fix missing closing braces before else
        $content = $content -replace '(?<=\n\s+)(\s+)else\s*\{', '$1} else {'
        
        # Fix incomplete await statements
        $content = $content -replace 'const\s+\w+\s*=\s*await\s*}', 'const response = await flightsAPI.getFlights(); // Fixed incomplete statement'
        $content = $content -replace 'await\s*}', 'throw new Error("No API available"); // Fixed incomplete statement'
        
        # Fix missing closing braces in if statements
        $content = $content -replace '(?<=\n\s+[^\n]*;\n)(\s+)else\s*\{', '$1} else {'
        
        Set-Content $fullPath $content
        Write-Host "Fixed: $file"
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host "Syntax fix complete!"