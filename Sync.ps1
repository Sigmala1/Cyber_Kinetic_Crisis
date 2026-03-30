param (
    [Parameter(Mandatory=$false)]
    [string]$Message = "Update files"
)

Write-Host "Adding local files to Git..."
git add .

Write-Host "Committing changes with message: '$Message'..."
git commit -m $Message

Write-Host "Uploading to GitHub..."
git push origin main

Write-Host "Done!"
