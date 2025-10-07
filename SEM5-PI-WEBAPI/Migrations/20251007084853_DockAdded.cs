using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEM5_PI_WEBAPI.Migrations
{
    /// <inheritdoc />
    public partial class DockAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Dock",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    LengthM = table.Column<double>(type: "REAL", nullable: false),
                    DepthM = table.Column<double>(type: "REAL", nullable: false),
                    MaxDraftM = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dock", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DockAllowedVesselTypes",
                columns: table => new
                {
                    VesselTypeId = table.Column<string>(type: "TEXT", nullable: false),
                    DockId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DockAllowedVesselTypes", x => new { x.DockId, x.VesselTypeId });
                    table.ForeignKey(
                        name: "FK_DockAllowedVesselTypes_Dock_DockId",
                        column: x => x.DockId,
                        principalTable: "Dock",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dock_Code",
                table: "Dock",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DockAllowedVesselTypes");

            migrationBuilder.DropTable(
                name: "Dock");
        }
    }
}
