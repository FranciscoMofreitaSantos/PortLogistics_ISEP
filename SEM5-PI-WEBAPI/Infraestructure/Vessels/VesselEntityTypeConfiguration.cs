using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.Vessels;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Infraestructure.Vessels
{
    public class VesselEntityTypeConfiguration : IEntityTypeConfiguration<Vessel>
    {
        public void Configure(EntityTypeBuilder<Vessel> builder)
        {
            
            builder.HasKey(b => b.Id);
            builder.OwnsOne(v => v.ImoNumber, imo =>
            {
                imo.Property(p => p.Value)
                    .HasColumnName("ImoNumber")
                    .IsRequired();
            });

            builder.Property(v => v.Name)
                .IsRequired();
            
            builder.Property(v => v.Owner)
                .IsRequired();

            builder.HasOne<VesselType>()                
                .WithMany()                           
                .HasForeignKey(v => v.VesselTypeId)   
                .IsRequired();
            
        }
    }
}

