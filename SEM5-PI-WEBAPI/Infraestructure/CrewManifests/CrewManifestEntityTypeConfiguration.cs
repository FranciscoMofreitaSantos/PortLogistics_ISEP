using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.CrewManifests;

namespace SEM5_PI_WEBAPI.Infraestructure.CrewManifests;

public class CrewManifestEntityTypeConfiguration : IEntityTypeConfiguration<CrewManifest>
{
    public void Configure(EntityTypeBuilder<CrewManifest> builder)
    {
        builder.ToTable("CrewManifests");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TotalCrew)
            .IsRequired();

        builder.Property(c => c.CaptainName)
            .IsRequired();

        builder.HasMany(c => c.CrewMembers)
            .WithOne()
            .HasForeignKey("CrewManifestId")
            .IsRequired();
    }
}