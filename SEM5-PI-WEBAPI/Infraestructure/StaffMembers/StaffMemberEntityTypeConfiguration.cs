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
    
    builder.Ignore(s => s.Qualifications);

  
    builder.OwnsMany(s => s.Qualifications, q =>
    {
        q.ToTable("StaffMember_Qualification");
        q.WithOwner().HasForeignKey("StaffMemberId");
        
        q.Property<int>("Id");
        q.HasKey("Id");
        
        q.Property(qid => qid.Value)
            .HasColumnName("QualificationId")
            .IsRequired();
        
        q.HasIndex("StaffMemberId", "Value").IsUnique();
    });

    builder.Navigation(s => s.Qualifications)
        .UsePropertyAccessMode(PropertyAccessMode.Field);
}
}
