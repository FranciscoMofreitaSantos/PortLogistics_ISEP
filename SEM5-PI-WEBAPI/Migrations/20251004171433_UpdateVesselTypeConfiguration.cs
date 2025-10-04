using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEM5_PI_WEBAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVesselTypeConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImoNumber_Value",
                table: "Vessel",
                newName: "ImoNumber");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "VesselType",
                type: "TEXT",
                nullable: false,
                defaultValue: "No description",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.CreateIndex(
                name: "IX_VesselType_Name",
                table: "VesselType",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vessel_VesselTypeId",
                table: "Vessel",
                column: "VesselTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vessel_VesselType_VesselTypeId",
                table: "Vessel",
                column: "VesselTypeId",
                principalTable: "VesselType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vessel_VesselType_VesselTypeId",
                table: "Vessel");

            migrationBuilder.DropIndex(
                name: "IX_VesselType_Name",
                table: "VesselType");

            migrationBuilder.DropIndex(
                name: "IX_Vessel_VesselTypeId",
                table: "Vessel");

            migrationBuilder.RenameColumn(
                name: "ImoNumber",
                table: "Vessel",
                newName: "ImoNumber_Value");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "VesselType",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldDefaultValue: "No description");
        }
    }
}
