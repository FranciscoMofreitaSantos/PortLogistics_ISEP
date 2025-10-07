using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.Dock;

namespace SEM5_PI_WEBAPI.Infraestructure.Docks
{
    public class DockEntityTypeConfiguration : IEntityTypeConfiguration<Dock>
    {
        public void Configure(EntityTypeBuilder<Dock> builder)
        {
            builder.HasKey(d => d.Id);

            builder.OwnsOne(d => d.Code, code =>
            {
                code.Property(p => p.Value)
                    .HasColumnName("Code")
                    .IsRequired();

                code.HasIndex(p => p.Value).IsUnique();
            });

            builder.Property(d => d.Location)
                .HasMaxLength(150)
                .IsRequired();

            builder.Property(d => d.LengthM).IsRequired();
            builder.Property(d => d.DepthM).IsRequired();
            builder.Property(d => d.MaxDraftM).IsRequired();
            
            builder.OwnsMany(d => d.AllowedVesselTypeIds, a =>
            {
                a.ToTable("DockAllowedVesselTypes");

                a.WithOwner().HasForeignKey("DockId");

                a.Property(v => v.Value)
                    .HasColumnName("VesselTypeId")
                    .IsRequired();

                a.HasKey("DockId", "Value");

                // (Opcional) criar FK real para a tabela VesselType
                // a.HasOne<SEM5_PI_WEBAPI.Domain.VesselsTypes.VesselType>()
                //  .WithMany()
                //  .HasForeignKey("VesselTypeId")
                //  .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Navigation(d => d.AllowedVesselTypeIds)
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}
