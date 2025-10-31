using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropLegacyMaintenanceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_AgendadoPara",
                table: "Manutencoes");

            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_Status",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "AgendadoPara",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "CentroCusto",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Observacoes",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Progresso",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Manutencoes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AgendadoPara",
                table: "Manutencoes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CentroCusto",
                table: "Manutencoes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observacoes",
                table: "Manutencoes",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Progresso",
                table: "Manutencoes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Manutencoes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_AgendadoPara",
                table: "Manutencoes",
                column: "AgendadoPara");

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_Status",
                table: "Manutencoes",
                column: "Status");
        }
    }
}
