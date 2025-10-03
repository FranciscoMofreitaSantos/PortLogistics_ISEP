using Serilog;

namespace SEM5_PI_WEBAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                CreateLogsConfigurations();
                CreateHostBuilder(args).Build().Run();
            }
            catch(Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static void CreateLogsConfigurations()
        {
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .WriteTo.Logger(lc => 
                    lc.Filter.ByExcluding(e =>
                        e.Properties.ContainsKey("SourceContext") && (
                            e.Properties["SourceContext"].ToString().Contains("SEM5_PI_WEBAPI.Controllers") ||
                            e.Properties["SourceContext"].ToString().Contains("SEM5_PI_WEBAPI.Domain") ||
                            e.Properties["SourceContext"].ToString().Contains("RequestLogsMiddleware")
                            )
                        )
                        .WriteTo.Console(
                            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext,-70} - {Message:lj}{NewLine}{Exception}"
                            )
                    )
                .WriteTo.File("Logs/GeneralLogs/general-.log",
                    rollingInterval: RollingInterval.Day,
                    outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext,-70} - {Message:lj}{NewLine}{Exception}"
                    )

                .WriteTo.Logger(lc => lc
                    .Filter.ByIncludingOnly(e=>
                        e.Properties.ContainsKey("SourceContext") &&(
                            e.Properties["SourceContext"].ToString().Contains("SEM5_PI_WEBAPI.Domain.VesselsTypes")
                            ||
                            e.Properties["SourceContext"].ToString().Contains("RequestLogsMiddleware")
                            ||
                            e.Properties["SourceContext"].ToString().Contains("SEM5_PI_WEBAPI.Controllers.VesselTypeController")
                            )
                        )
                    .WriteTo.File("Logs/VesselsTypes/vesseltype-.log",
                        rollingInterval: RollingInterval.Day,
                        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext,-55} - {Message:lj}{NewLine}{Exception}")
                )

                .CreateLogger();


            Log.Information("Starting web host");
        }
        
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}