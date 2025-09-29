using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;
using SEM5_PI_WEBAPI.Infraestructure.VesselsTypes;

namespace SEM5_PI_WEBAPI.Infraestructure
{
    public class DddSample1DbContext : DbContext
    {
        public DbSet<VesselType> Categories { get; set; }
        

        public DddSample1DbContext(DbContextOptions options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new VesselTypeEntityTypeConfiguration());
        }
    }
}