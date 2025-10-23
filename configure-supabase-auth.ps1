# Configure Supabase Auth Settings for Production
# This script helps you configure the auth settings via Supabase Management API

param(
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
    [string]$ProjectRef = "uebidzpkptdmcnqjaody",
    [string]$SiteUrl = "https://uslugo.vercel.app"
)

$RedirectUrls = @(
    "https://uslugo.vercel.app/auth/callback",
    "http://localhost:3000/auth/callback"
)

if (-not $AccessToken) {
    Write-Host "❌ SUPABASE_ACCESS_TOKEN environment variable is required" -ForegroundColor Red
    Write-Host "Get your access token from: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set the token, run:" -ForegroundColor Cyan
    Write-Host "`$env:SUPABASE_ACCESS_TOKEN = 'your-token-here'" -ForegroundColor White
    exit 1
}

Write-Host "🚀 Configuring Supabase Auth Settings..." -ForegroundColor Green
Write-Host "📋 Project: $ProjectRef" -ForegroundColor Cyan
Write-Host "🌐 Site URL: $SiteUrl" -ForegroundColor Cyan
Write-Host "🔄 Redirect URLs: $($RedirectUrls -join ', ')" -ForegroundColor Cyan
Write-Host ""

# Create the auth settings payload
$AuthSettings = @{
    site_url = $SiteUrl
    redirect_urls = $RedirectUrls
    email_confirmations_enabled = $false
    email_change_confirmations_enabled = $false
    password_resets_enabled = $true
} | ConvertTo-Json -Depth 3

try {
    $Headers = @{
        'Authorization' = "Bearer $AccessToken"
        'Content-Type' = 'application/json'
    }

    $Uri = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"
    
    Write-Host "📡 Sending request to Supabase API..." -ForegroundColor Yellow
    
    $Response = Invoke-RestMethod -Uri $Uri -Method PATCH -Headers $Headers -Body $AuthSettings
    
    Write-Host "✅ Auth settings updated successfully!" -ForegroundColor Green
    Write-Host "📧 Site URL: $SiteUrl" -ForegroundColor Cyan
    Write-Host "🔄 Redirect URLs: $($RedirectUrls -join ', ')" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "🎉 Configuration complete!" -ForegroundColor Green
    Write-Host "🔗 Your production site should now work with password reset flow." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test password reset at: https://uslugo.vercel.app/forgot-password" -ForegroundColor White
    Write-Host "2. Check that emails redirect properly to /auth/callback" -ForegroundColor White
    Write-Host "3. Verify the reset password page works" -ForegroundColor White
    
} catch {
    Write-Host "❌ Configuration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}
