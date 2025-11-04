using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarPrimeiroLogin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PrimeiroLogin",
                table: "Usuarios",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrimeiroLogin",
                table: "Usuarios");
        }
    }
}
