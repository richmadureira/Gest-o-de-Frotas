USE GestaoFrotas_Dev;
GO

-- Passo 1: Adicionar coluna Status com valor padrão
ALTER TABLE Manutencoes ADD Status INT NOT NULL DEFAULT 1;
GO

-- Passo 2: Migrar dados de StatusSAP para Status
UPDATE Manutencoes 
SET Status = CASE 
    WHEN StatusSAP = 1 THEN 1
    WHEN StatusSAP = 2 THEN 2
    WHEN StatusSAP = 3 THEN 2
    WHEN StatusSAP = 4 THEN 2
    WHEN StatusSAP = 5 THEN 2
    WHEN StatusSAP = 6 THEN 2
    WHEN StatusSAP = 7 THEN 3
    WHEN StatusSAP IS NULL THEN 1
    ELSE 1
END;
GO

-- Passo 3: Remover colunas SAP
ALTER TABLE Manutencoes DROP COLUMN StatusSAP;
GO

ALTER TABLE Manutencoes DROP COLUMN NumeroOrdemSAP;
GO

ALTER TABLE Manutencoes DROP COLUMN FornecedorSAP;
GO

-- Passo 4: Registrar migration
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
VALUES ('20250115000000_RemoveStatusSAP', '9.0.9');
GO

PRINT 'Migration aplicada com sucesso!';
GO

