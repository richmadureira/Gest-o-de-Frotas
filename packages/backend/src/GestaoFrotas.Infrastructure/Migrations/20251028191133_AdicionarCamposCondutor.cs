using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCamposCondutor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CnhCategoria",
                table: "Usuarios",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CnhNumero",
                table: "Usuarios",
                type: "nvarchar(11)",
                maxLength: 11,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CnhValidade",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Matricula",
                table: "Usuarios",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TurnoTrabalho",
                table: "Usuarios",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Matricula",
                table: "Usuarios",
                column: "Matricula",
                unique: true,
                filter: "[Matricula] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Usuarios_Matricula",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CnhCategoria",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CnhNumero",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "CnhValidade",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Matricula",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TurnoTrabalho",
                table: "Usuarios");
        }
    }
}
