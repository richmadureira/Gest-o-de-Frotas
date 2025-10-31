using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenancePriorityAndFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<string>(
                name: "Prioridade",
                table: "Manutencoes",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "QuilometragemNoAto",
                table: "Manutencoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SolicitanteId",
                table: "Manutencoes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Manutencoes_Prioridade",
                table: "Manutencoes",
                column: "Prioridade");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Manutencoes_Prioridade",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "CentroCusto",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Observacoes",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "Prioridade",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "QuilometragemNoAto",
                table: "Manutencoes");

            migrationBuilder.DropColumn(
                name: "SolicitanteId",
                table: "Manutencoes");
        }
    }
}
