using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Domain.Qualifications;

namespace SEM5_PI_WEBAPI.Infraestructure.StaffMembers;

public class StaffMemberEntityTypeConfiguration : IEntityTypeConfiguration<StaffMember>
{
    public void Configure(EntityTypeBuilder<StaffMember> builder)
{
    builder.HasKey(k => k.Id);

    builder.Property(s => s.ShortName)
        .IsRequired()
        .HasMaxLength(20);

    var mecanographicNumberConverter = new ValueConverter<MecanographicNumber, string>(
        v => v.ToString(),
        v => new MecanographicNumber(v));

    builder.Property(s => s.MecanographicNumber)
        .HasConversion(mecanographicNumberConverter)
        .IsRequired()
        .HasMaxLength(7);

    builder.Property(s => s.IsActive)
        .IsRequired();

    builder.OwnsOne(s => s.Email, email =>
    {
        email.Property(e => e.Address)
            .HasColumnName("Email")
            .IsRequired();
    });

    builder.OwnsOne(s => s.Phone, phone =>
    {
        phone.Property(p => p.Number)
            .HasColumnName("Phone")
            .IsRequired();
    });

    builder.OwnsOne(s => s.Schedule, schedule =>
    {
        schedule.Property(sch => sch.Shift)
            .HasColumnName("Shift")
            .IsRequired();

        schedule.Property(sch => sch.Days)
            .HasColumnName("Days")
            .IsRequired();
    });
    
    builder
        .Ignore(s => s.Qualifications); 
    
    builder
        .HasMany<Qualification>()
        .WithMany()
        .UsingEntity<Dictionary<string, object>>(
            "StaffMember_Qualification",
            j => j
                .HasOne<Qualification>()
                .WithMany()
                .HasForeignKey("QualificationId")
                .HasConstraintName("FK_StaffMember_Qualification_QualificationId")
                .OnDelete(DeleteBehavior.Cascade),
            j => j
                .HasOne<StaffMember>()
                .WithMany()
                .HasForeignKey("StaffMemberId")
                .HasConstraintName("FK_StaffMember_Qualification_StaffMemberId")
                .OnDelete(DeleteBehavior.Cascade),
            j =>
            {
                j.HasKey("StaffMemberId", "QualificationId");
                j.ToTable("StaffMember_Qualification");
            });
}
}
