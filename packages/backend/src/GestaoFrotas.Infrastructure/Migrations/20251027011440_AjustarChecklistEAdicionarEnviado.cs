using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjustarChecklistEAdicionarEnviado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Buzina",
                table: "Checklists");

            migrationBuilder.DropColumn(
                name: "Combustivel",
                table: "Checklists");

            migrationBuilder.DropColumn(
                name: "Documentos",
                table: "Checklists");

            migrationBuilder.DropColumn(
                name: "ParaBrisa",
                table: "Checklists");

            migrationBuilder.DropColumn(
                name: "Retrovisores",
                table: "Checklists");

            migrationBuilder.DropColumn(
                name: "Turno",
                table: "Checklists");

            migrationBuilder.RenameColumn(
                name: "ImagemParaBrisa",
                table: "Checklists",
                newName: "ImagemOutrasAvarias");

            migrationBuilder.AddColumn<bool>(
                name: "Enviado",
                table: "Checklists",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Enviado",
                table: "Checklists");

            migrationBuilder.RenameColumn(
                name: "ImagemOutrasAvarias",
                table: "Checklists",
                newName: "ImagemParaBrisa");

            migrationBuilder.AddColumn<bool>(
                name: "Buzina",
                table: "Checklists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Combustivel",
                table: "Checklists",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "Documentos",
                table: "Checklists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParaBrisa",
                table: "Checklists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Retrovisores",
                table: "Checklists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Turno",
                table: "Checklists",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }
    }
}
