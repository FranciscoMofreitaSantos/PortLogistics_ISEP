using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;
using SEM5_PI_WEBAPI.Infraestructure;

namespace SEM5_PI_WEBAPI.Tests.utils
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Diz ao Startup que estamos em ambiente "Testing"
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                var sp = services.BuildServiceProvider();

                using var scope = sp.CreateScope();
                var ctx = scope.ServiceProvider.GetRequiredService<DddSample1DbContext>();

                // BD InMemory; basta garantir que está criada
                ctx.Database.EnsureCreated();

                // Seed
                if (!ctx.VesselType.Any())
                {
                    var vt = new VesselType(
                        nameIn: "InitialCargo",
                        maxBaysIn: 10,
                        maxRowsIn: 8,
                        maxTiersIn: 6,
                        descriptionIn: "Seeded vessel type for system tests"
                    );

                    ctx.VesselType.Add(vt);
                    ctx.SaveChanges();
                }
            });
        }
    }
}