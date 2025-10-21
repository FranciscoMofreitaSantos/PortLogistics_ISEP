using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
namespace SEM5_PI_WEBAPI.Infraestructure.ShippingAgentOrganizations
{
    internal class ShippingAgentOrganizationEntityTypeConfiguration : IEntityTypeConfiguration<ShippingAgentOrganization>
    {
        public void Configure(EntityTypeBuilder<ShippingAgentOrganization> builder)
        {
            builder.ToTable("ShippingAgentOrganizations");

            builder.HasKey(b => b.Id);
            
            builder.Property(b => b.ShippingOrganizationCode)
                .HasConversion(
                    code => code.Value,
                    str => new ShippingOrganizationCode(str)
                )
                .HasColumnName("ShippingOrganizationCode")
                .IsRequired();
            
            builder.Property(b => b.LegalName)
                .IsRequired();

            builder.Property(b => b.AltName)
                .IsRequired();

            builder.Property(b => b.Address)
                .IsRequired();

            builder.Property(b => b.Taxnumber)
                .HasConversion(
                    tax => tax.Value,
                    str => new TaxNumber(str)
                )
                .HasColumnName("TaxNumber")
                .IsRequired();

        }
    }
}