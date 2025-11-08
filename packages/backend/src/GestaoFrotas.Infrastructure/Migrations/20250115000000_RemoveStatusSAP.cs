using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStatusSAP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Adicionar coluna Status (int, NOT NULL, DEFAULT 1 = Agendada)
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Manutencoes",
                type: "int",
                nullable: false,
                defaultValue: 1);

            // Migrar dados: converter StatusSAP para Status
            // StatusSAP.Solicitada (1) -> Status.Agendada (1)
            // StatusSAP.Aprovada (2) -> Status.EmAndamento (2)
            // StatusSAP.EnviadaSAP (3) -> Status.EmAndamento (2)
            // StatusSAP.ProcessandoSAP (4) -> Status.EmAndamento (2)
            // StatusSAP.OrdemCriada (5) -> Status.EmAndamento (2)
            // StatusSAP.EmExecucao (6) -> Status.EmAndamento (2)
            // StatusSAP.Finalizada (7) -> Status.Concluida (3)
            migrationBuilder.Sql(@"
                UPDATE Manutencoes 
                SET Status = CASE 
                    WHEN StatusSAP = 1 THEN 1  -- Solicitada -> Agendada
                    WHEN StatusSAP = 2 THEN 2  -- Aprovada -> EmAndamento
                    WHEN StatusSAP = 3 THEN 2  -- EnviadaSAP -> EmAndamento
                    WHEN StatusSAP = 4 THEN 2  -- ProcessandoSAP -> EmAndamento
                    WHEN StatusSAP = 5 THEN 2  -- OrdemCriada -> EmAndamento
                    WHEN StatusSAP = 6 THEN 2  -- EmExecucao -> EmAndamento
                    WHEN StatusSAP = 7 THEN 3  -- Finalizada -> Concluida
                    ELSE 1  -- NULL ou outros -> Agendada (padrão)
                END
            ");

            // Remover colunas SAP
            migrationBuilder.DropColumn(
                name: "FornecedorSAP",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "NumeroOrdemSAP",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "StatusSAP",
                table: "Manutencoes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restaurar colunas SAP
            migrationBuilder.AddColumn<string>(
                name: "FornecedorSAP",
                table: "Manutencoes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroOrdemSAP",
                table: "Manutencoes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusSAP",
                table: "Manutencoes",
                type: "int",
                nullable: true);

            // Migrar dados de volta: Status -> StatusSAP
            migrationBuilder.Sql(@"
                UPDATE Manutencoes 
                SET StatusSAP = CASE 
                    WHEN Status = 1 THEN 1  -- Agendada -> Solicitada
                    WHEN Status = 2 THEN 6  -- EmAndamento -> EmExecucao
                    WHEN Status = 3 THEN 7  -- Concluida -> Finalizada
                    WHEN Status = 4 THEN NULL  -- Cancelada -> NULL
                    ELSE NULL
                END
            ");

            // Remover coluna Status
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Manutencoes");
        }
    }
}

