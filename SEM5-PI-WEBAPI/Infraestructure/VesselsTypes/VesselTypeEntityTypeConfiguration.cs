using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Infraestructure.VesselsTypes
{
    internal class VesselTypeEntityTypeConfiguration : IEntityTypeConfiguration<VesselType>
    {
        public void Configure(EntityTypeBuilder<VesselType> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Name)
                .IsRequired();

            builder.Property(b => b.Description)
                .HasDefaultValue("No description");

            builder.Property(b => b.MaxBays)
                .IsRequired();

            builder.Property(b => b.MaxRows)
                .IsRequired();

            builder.Property(b => b.MaxTiers)
                .IsRequired();

            builder.Property(b => b.Capacity)
                .IsRequired();

            builder.HasIndex(b => b.Name).IsUnique();
        }
    }
}