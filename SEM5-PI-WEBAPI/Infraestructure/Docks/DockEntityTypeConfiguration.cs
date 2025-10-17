using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.Dock;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Infraestructure.Docks
{
    public class DockEntityTypeConfiguration : IEntityTypeConfiguration<EntityDock>
    {
        public void Configure(EntityTypeBuilder<EntityDock> builder)
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

            builder.Property(d => d.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            // PhysicalResourceCodes continua como OwnsMany (não é relação)
            builder.OwnsMany(d => d.PhysicalResourceCodes, prc =>
            {
                prc.ToTable("DockPhysicalResourceCodes");
                prc.WithOwner().HasForeignKey("DockId");
                prc.Property<int>("Id");
                prc.HasKey("Id");
                prc.Property(p => p.Value)
                    .HasColumnName("PhysicalResourceCode")
                    .IsRequired();
                prc.HasIndex("DockId", "Value").IsUnique();
            });

            
            builder.Ignore(d => d.AllowedVesselTypeIds);
            
            builder
                .HasMany<VesselType>()
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "Dock_VesselType",
                    j => j
                        .HasOne<VesselType>()
                        .WithMany()
                        .HasForeignKey("VesselTypeId")
                        .HasConstraintName("FK_Dock_VesselType_VesselTypeId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<EntityDock>()
                        .WithMany()
                        .HasForeignKey("DockId")
                        .HasConstraintName("FK_Dock_VesselType_DockId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("DockId", "VesselTypeId");
                        j.ToTable("Dock_VesselType");
                    });

            builder.Navigation(d => d.PhysicalResourceCodes)
                .UsePropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}