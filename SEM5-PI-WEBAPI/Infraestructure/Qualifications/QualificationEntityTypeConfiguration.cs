using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SEM5_PI_WEBAPI.Domain.Qualifications;

internal class QualificationEntityTypeConfiguration : IEntityTypeConfiguration<Qualification>
{
    public void Configure(EntityTypeBuilder<Qualification> builder)
    {
        var qualificationIdConverter = new ValueConverter<QualificationId, Guid>(
            id => id.AsGuid(),
            guid => new QualificationId(guid)
        );

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasConversion(qualificationIdConverter)
            .ValueGeneratedNever();

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(15);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.ToTable("Qualifications");
    }
}