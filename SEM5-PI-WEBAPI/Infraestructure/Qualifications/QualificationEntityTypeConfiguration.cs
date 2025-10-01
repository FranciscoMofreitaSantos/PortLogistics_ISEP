using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.Qualifications;

namespace SEM5_PI_WEBAPI.Infraestructure.Qualifications;

internal class QualificationEntityTypeConfiguration : IEntityTypeConfiguration<Qualification>
{
    public void Configure(EntityTypeBuilder<Qualification> builder)
    {
        //builder.ToTable("Qualifications", SchemaNames.DDDSample1);
        builder.HasKey(b => b.Id);
    }
}