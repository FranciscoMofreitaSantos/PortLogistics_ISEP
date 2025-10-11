using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.VVN;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Infraestructure.VVN
{
    public class VesselVisitNotificationTypeConfiguration : IEntityTypeConfiguration<VesselVisitNotification>
    {
        public void Configure(EntityTypeBuilder<VesselVisitNotification> builder)
        {
            builder.HasKey(v => v.Id);

            builder.OwnsOne(v => v.Code, code =>
            {
                code.Property(c => c.Code)
                    .HasColumnName("Code")
                    .IsRequired();
            });

            // ClockTime (ETA, ETD, etc.)
            builder.OwnsOne(v => v.EstimatedTimeArrival, eta =>
            {
                eta.Property(e => e.Value)
                    .HasColumnName("EstimatedTimeArrival")
                    .IsRequired();
            });

            builder.OwnsOne(v => v.EstimatedTimeDeparture, etd =>
            {
                etd.Property(e => e.Value)
                    .HasColumnName("EstimatedTimeDeparture")
                    .IsRequired();
            });

            builder.OwnsOne(v => v.ActualTimeArrival, ata =>
            {
                ata.Property(e => e.Value)
                    .HasColumnName("ActualTimeArrival");
            });

            builder.OwnsOne(v => v.ActualTimeDeparture, atd =>
            {
                atd.Property(e => e.Value)
                    .HasColumnName("ActualTimeDeparture");
            });

            builder.OwnsOne(v => v.AcceptenceDate, acc =>
            {
                acc.Property(e => e.Value)
                    .HasColumnName("AcceptanceDate");
            });

            builder.OwnsOne(v => v.VesselImo, imo =>
            {
                imo.Property(i => i.Value)
                    .HasColumnName("VesselImo")
                    .IsRequired();
            });

            builder.Property(v => v.Volume)
                .IsRequired();

            builder.Property(v => v.Status)
                .HasConversion<string>() // enum as string
                .IsRequired();

            // RELATIONSHIPS

            // 1..* Docks
            builder.HasMany(v => v.ListDocks)
                .WithMany() // Many-to-many (VVN ↔ Docks)
                .UsingEntity(j =>
                    j.ToTable("VvnDocks")); // join table name

            // 1..1 CrewManifest
            builder.HasOne(v => v.CrewManifest)
                .WithMany()
                .HasForeignKey("CrewManifestId")
                .OnDelete(DeleteBehavior.Restrict);

            // 1..1 LoadingCargoManifest
            builder.HasOne(v => v.LoadingCargoManifest)
                .WithMany()
                .HasForeignKey("LoadingCargoManifestId")
                .OnDelete(DeleteBehavior.Restrict);

            // 1..1 UnloadingCargoManifest
            builder.HasOne(v => v.UnloadingCargoManifest)
                .WithMany()
                .HasForeignKey("UnloadingCargoManifestId")
                .OnDelete(DeleteBehavior.Restrict);
            
            
            builder.ToTable("VesselVisitNotifications");
        }
    }
}
