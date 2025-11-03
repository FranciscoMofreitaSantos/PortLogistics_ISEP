using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Infraestructure.StorageAreas;

public class StorageAreaEntityTypeConfiguration : IEntityTypeConfiguration<StorageArea>
{
    public void Configure(EntityTypeBuilder<StorageArea> builder)
    {
        builder.ToTable("StorageAreas");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired();

        builder.Property(b => b.Description);

        builder.Property(b => b.Type)
            .IsRequired();

        builder.Property(b => b.MaxBays).IsRequired();
        builder.Property(b => b.MaxRows).IsRequired();
        builder.Property(b => b.MaxTiers).IsRequired();
        builder.Property(b => b.CurrentCapacityTeu).IsRequired();

        builder.OwnsMany(sa => sa.DistancesToDocks, nav =>
        {
            nav.WithOwner().HasForeignKey("StorageAreaId"); 
            nav.Property<Guid>("Id");
            nav.HasKey("Id");

            nav.OwnsOne(d => d.Dock, dock =>
            {
                dock.Property(p => p.Value)
                    .HasColumnName("DockCode")
                    .IsRequired();
            });

            nav.Property(d => d.Distance)
                .HasColumnName("Distance")
                .IsRequired();
        });
        
        builder.OwnsMany(sa => sa.PhysicalResources, nav =>
        {
            nav.WithOwner().HasForeignKey("StorageAreaId");
            nav.Property<Guid>("Id");
            nav.HasKey("Id");

            nav.Property(p => p.Value)
                .HasColumnName("PhysicalResourceCode")
                .IsRequired();
        });


        builder.OwnsMany(sa => sa.Slots, nav =>
        {
            nav.ToTable("StorageAreaSlots");

            nav.WithOwner().HasForeignKey("StorageAreaId");

            nav.Property(s => s.Id)
                .HasConversion(
                    v => v.Value,                          // VO → Guid
                    v => new StorageAreaSlotId(v)          // Guid → VO
                )
                .ValueGeneratedNever();

            nav.Property(s => s.StorageAreaId)
                .HasConversion(
                    v => v.Value,
                    v => new StorageAreaId(v)
                );

            nav.HasKey(s => s.Id);

            nav.Property(s => s.Bay).IsRequired();
            nav.Property(s => s.Row).IsRequired();
            nav.Property(s => s.Tier).IsRequired();

            nav.Property(s => s.ContainerIsoCode)
                .HasColumnName("ContainerISO")
                .IsRequired(false);
        });


        
        builder.Ignore(b => b.MaxCapacityTeu);
        builder.Ignore("_grid");
        builder.HasIndex(b => b.Name).IsUnique();
    }
}