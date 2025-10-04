using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEM5_PI_WEBAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddVesselTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "VesselType",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Vessel",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    ImoNumber_Value = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Owner = table.Column<string>(type: "TEXT", nullable: false),
                    VesselTypeId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vessel", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Vessel");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "VesselType",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }
    }
}
