using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoFrotas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelWithDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Esta migration sincroniza o modelo com o estado atual do banco de dados
            // Todas as alterações já foram aplicadas manualmente via SQL
            // Esta migration apenas registra que o modelo está sincronizado
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Não há operações para reverter pois as alterações já estão no banco
        }
    }
}





