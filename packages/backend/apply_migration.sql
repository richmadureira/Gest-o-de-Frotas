-- Aplicar migration RemoveStatusSAP
USE GestaoFrotas_Dev;
GO

-- Verificar se a coluna Status já existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Manutencoes') AND name = 'Status')
BEGIN
    -- Adicionar coluna Status
    ALTER TABLE Manutencoes ADD Status INT NOT NULL DEFAULT 1;
    
    -- Migrar dados de StatusSAP para Status
    UPDATE Manutencoes 
    SET Status = CASE 
        WHEN StatusSAP = 1 THEN 1  -- Solicitada -> Agendada
        WHEN StatusSAP = 2 THEN 2  -- Aprovada -> EmAndamento
        WHEN StatusSAP = 3 THEN 2  -- EnviadaSAP -> EmAndamento
        WHEN StatusSAP = 4 THEN 2  -- ProcessandoSAP -> EmAndamento
        WHEN StatusSAP = 5 THEN 2  -- OrdemCriada -> EmAndamento
        WHEN StatusSAP = 6 THEN 2  -- EmExecucao -> EmAndamento
        WHEN StatusSAP = 7 THEN 3  -- Finalizada -> Concluida
        WHEN StatusSAP IS NULL THEN 1  -- NULL -> Agendada
        ELSE 1  -- Outros -> Agendada
    END;
    
    -- Remover colunas SAP
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Manutencoes') AND name = 'StatusSAP')
        ALTER TABLE Manutencoes DROP COLUMN StatusSAP;
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Manutencoes') AND name = 'NumeroOrdemSAP')
        ALTER TABLE Manutencoes DROP COLUMN NumeroOrdemSAP;
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Manutencoes') AND name = 'FornecedorSAP')
        ALTER TABLE Manutencoes DROP COLUMN FornecedorSAP;
    
    -- Registrar a migration como aplicada
    IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20250115000000_RemoveStatusSAP')
    BEGIN
        INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
        VALUES ('20250115000000_RemoveStatusSAP', '9.0.9');
    END
    
    PRINT 'Migration aplicada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Migration já foi aplicada anteriormente.';
END
GO

