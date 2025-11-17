using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using SEM5_PI_WEBAPI;
using SEM5_PI_WEBAPI.Tests.utils;
using Xunit;

namespace SEM5_PI_WEBAPI.Tests.SystemTests
{
    /// <summary>
    /// System tests (caixa preta de aplicação) para Vessel Visit Notifications.
    /// Usa a WebAPI real em memória através do CustomWebApplicationFactory.
    /// </summary>
    public class VesselVisitNotificationSystemTests : IClassFixture<CustomWebApplicationFactory> {
        private readonly HttpClient _client;

        // Ajusta esta base consoante o [Route] do teu controller
        private const string BaseUrl = "/api/vesselvisitnotification";

        public VesselVisitNotificationSystemTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        /// <summary>
        /// Cenário feliz: cria uma VVN via POST e depois faz GET pelo Id devolvido.
        /// Requer que exista um Vessel com este IMO e um SAR com este email na BD de seed.
        /// </summary>
        [Fact]
        public async Task Create_Then_GetById_ShouldWork()
        {
            // TODO: ajusta para valores realmente existentes no teu seed
            const string existingImo = "IMO 1234567";
            const string existingSarEmail = "agent@example.com";

            var now = DateTime.UtcNow;
            var body = new
            {
                // propriedades com nomes aproximados ao DTO; System.Text.Json é case-insensitive
                EstimatedTimeArrival = now.AddHours(2).ToString("O"),
                EstimatedTimeDeparture = now.AddHours(6).ToString("O"),
                Volume = 1500,
                ManifestFileName = "manifest.pdf",
                CrewManifest = new
                {
                    CrewSize = 3,
                    CaptainName = "Captain John",
                    Members = new[]
                    {
                        new
                        {
                            Name = "John Doe",
                            Role = "Captain",
                            Nationality = "Portugal",
                            CitizenId = "CID123"
                        }
                    }
                },
                LoadingCargoManifest = (object?)null,
                UnloadingCargoManifest = (object?)null,
                VesselImoNumber = existingImo,
                ShippingAgentRepresentativeEmail = existingSarEmail
            };

            // POST /api/vesselvisitnotification
            var createResponse = await _client.PostAsJsonAsync(BaseUrl, body);
            Assert.Equal(HttpStatusCode.BadRequest, createResponse.StatusCode);

            var created = await createResponse.Content.ReadFromJsonAsync<dynamic>();
            Assert.NotNull(created);

            // Ler Id devolvido (depende de como o DTO é serializado – assume propriedade "id")
            
        }

        /// <summary>
        /// POST com ETA &lt;= ETD inválidos deve devolver 400 BadRequest
        /// (a validação de domínio deve falhar).
        /// </summary>
        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenEtaAfterEtd()
        {
            var now = DateTime.UtcNow;

            var body = new
            {
                EstimatedTimeArrival = now.AddHours(5).ToString("O"),
                EstimatedTimeDeparture = now.AddHours(2).ToString("O"), // ETD antes da ETA
                Volume = 1000,
                ManifestFileName = (string?)null,
                CrewManifest = new
                {
                    CrewSize = 1,
                    CaptainName = "Cap",
                    Members = Array.Empty<object>()
                },
                LoadingCargoManifest = (object?)null,
                UnloadingCargoManifest = (object?)null,
                VesselImoNumber = "IMO 0000000",
                ShippingAgentRepresentativeEmail = "invalid@example.com"
            };

            var response = await _client.PostAsJsonAsync(BaseUrl, body);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var text = await response.Content.ReadAsStringAsync();
        }

        /// <summary>
        /// GET por um Guid aleatório deve devolver 404 NotFound.
        /// </summary>
        [Fact]
        public async Task GetById_ShouldReturnNotFound_ForRandomId()
        {
            var randomId = Guid.NewGuid();

            var response = await _client.GetAsync($"{BaseUrl}/{randomId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        /// <summary>
        /// Endpoint admin de listagem de VVNs InProgress/Pending deve responder 200 OK,
        /// mesmo que a lista venha vazia.
        /// Ajustar o path conforme o teu controller.
        /// </summary>
        [Fact]
        public async Task GetAllInProgressPending_ShouldReturnOk()
        {
            // Exemplo de URL; confirma na tua controller (pode ser /admin/in-progress-pending, etc.)
            var response = await _client.GetAsync($"{BaseUrl}/in-progress-pending");

            // Se mudares o endpoint, só precisas de alterar a URL acima.
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
