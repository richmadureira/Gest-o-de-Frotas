using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCamposSAP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Progresso",
                table: "Manutencoes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StatusSAP",
                table: "Manutencoes",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FornecedorSAP",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "NumeroOrdemSAP",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Progresso",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "StatusSAP",
                table: "Manutencoes");
        }
    }
}
