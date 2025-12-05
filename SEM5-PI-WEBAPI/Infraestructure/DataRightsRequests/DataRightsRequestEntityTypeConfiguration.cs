using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

namespace SEM5_PI_WEBAPI.Infraestructure.DataRightsRequests;

public class DataRightsRequestEntityTypeConfiguration : IEntityTypeConfiguration<DataRightRequest>
{
    public void Configure(EntityTypeBuilder<DataRightRequest> builder)
    {
        builder.ToTable("DataRightsRequests");
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.RequestId).IsRequired();
        builder.HasIndex(x => x.RequestId).IsUnique();
        
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.UserEmail).IsRequired();
        
        
        
        builder.Property(x => x.Status).IsRequired().HasConversion<string>();
        builder.Property(x => x.Type).IsRequired().HasConversion<string>();

        
        builder.Property(x => x.Payload).IsRequired(false);
        
        builder.OwnsOne(x => x.CreatedOn, owned =>
        {
            owned.Property(ct => ct.Value).IsRequired().HasColumnName("CreatedOnDate");
        });
        
        builder.OwnsOne(x => x.UpdatedOn, owned =>
        {
            owned.Property(ct => ct.Value).HasColumnName("UpdatedOnDate");
        });

        builder.Property(x => x.ProcessedBy).IsRequired(false);
    }
}