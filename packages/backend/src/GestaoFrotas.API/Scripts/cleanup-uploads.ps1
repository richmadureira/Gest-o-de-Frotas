# Script para limpar arquivos de upload antigos
# Execute este script se houver problemas de acesso a arquivos

$uploadsPath = "wwwroot\uploads\checklists"

if (Test-Path $uploadsPath) {
    Write-Host "Limpando arquivos de upload antigos..."
    
    # Remover arquivos mais antigos que 1 hora
    $cutoffTime = (Get-Date).AddHours(-1)
    $files = Get-ChildItem -Path $uploadsPath -File | Where-Object { $_.LastWriteTime -lt $cutoffTime }
    
    foreach ($file in $files) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "Removido: $($file.Name)"
        }
        catch {
            Write-Warning "Não foi possível remover: $($file.Name) - $($_.Exception.Message)"
        }
    }
    
    Write-Host "Limpeza concluída!"
} else {
    Write-Host "Pasta de uploads não encontrada: $uploadsPath"
}
