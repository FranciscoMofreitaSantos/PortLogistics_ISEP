using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEM5_PI_WEBAPI.Migrations
{
    /// <inheritdoc />
    public partial class CargoManifestAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CargoManifestEntry_CargoManifest_CargoManifestId",
                table: "CargoManifestEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CargoManifest",
                table: "CargoManifest");

            migrationBuilder.RenameTable(
                name: "CargoManifest",
                newName: "CargoManifests");

            migrationBuilder.AlterColumn<string>(
                name: "CargoManifestId",
                table: "CargoManifestEntry",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CargoManifests",
                table: "CargoManifests",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CargoManifestEntry_CargoManifests_CargoManifestId",
                table: "CargoManifestEntry",
                column: "CargoManifestId",
                principalTable: "CargoManifests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CargoManifestEntry_CargoManifests_CargoManifestId",
                table: "CargoManifestEntry");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CargoManifests",
                table: "CargoManifests");

            migrationBuilder.RenameTable(
                name: "CargoManifests",
                newName: "CargoManifest");

            migrationBuilder.AlterColumn<string>(
                name: "CargoManifestId",
                table: "CargoManifestEntry",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CargoManifest",
                table: "CargoManifest",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CargoManifestEntry_CargoManifest_CargoManifestId",
                table: "CargoManifestEntry",
                column: "CargoManifestId",
                principalTable: "CargoManifest",
                principalColumn: "Id");
        }
    }
}
