using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;

namespace SEM5_PI_WEBAPI.Tests.SystemTests
{
    /// <summary>
    /// SUT = sistema completo (Program + Controllers + Services + Repos + EF).
    /// Testes de caixa-preta à API /api/Container.
    /// </summary>
    public class ContainerSystemTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        // Usamos códigos que já aparecem noutros testes/domínio e que sabemos ser válidos.
        // (Se algum coincidir com seed e der duplicado, é só trocar o código aqui.)
        private const string IsoForAll      = "CSQU0406393";
        private const string IsoForById     = "CSIU4400699";
        private const string IsoForPatchOk  = "CSQU3054383";
        private const string IsoForPatchBad = "HLCU9988776";
        private const string IsoForMissing  = "BBCU5100617"; // não criado em lado nenhum neste ficheiro

        public ContainerSystemTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        // ===================== HELPERS =======================

        private static string ExtractIsoFromJson(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("isoCode", out var isoNode))
                throw new InvalidOperationException($"JSON sem isoCode: {json}");

            // Caso típico: { "isoCode": { "value": "MSCU6639870" } }
            if (isoNode.ValueKind == JsonValueKind.Object &&
                isoNode.TryGetProperty("value", out var v) &&
                v.ValueKind == JsonValueKind.String)
            {
                return v.GetString()!;
            }

            // fallback se por acaso for string simples
            if (isoNode.ValueKind == JsonValueKind.String)
                return isoNode.GetString()!;

            throw new InvalidOperationException($"isoCode inesperado: {isoNode}");
        }

        private static string ExtractStringProp(string json, string propName)
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // as propriedades vêm em camelCase
            if (!root.TryGetProperty(propName, out var p))
                throw new InvalidOperationException($"JSON sem propriedade '{propName}': {json}");

            return p.GetString() ?? string.Empty;
        }

        private async Task<string> CreateContainerRawAsync(
            string iso,
            string? description = null,
            ContainerType type = ContainerType.General,
            double weightKg = 1000
        )
        {
            var dto = new CreatingContainerDto(
                iso,
                description ?? "System test container",
                type,
                weightKg
            );

            var response = await _client.PostAsJsonAsync("/api/Container", dto);
            var body = await response.Content.ReadAsStringAsync();

            // deixar quem chama decidir se quer Created ou não
            return body;
        }

        private async Task<(Guid id, string iso)> CreateContainerAsync(
            string iso,
            string? description = null,
            ContainerType type = ContainerType.General,
            double weightKg = 1000
        )
        {
            var dto = new CreatingContainerDto(
                iso,
                description ?? "System test container",
                type,
                weightKg
            );

            var response = await _client.PostAsJsonAsync("/api/Container", dto);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var returnedIso = ExtractIsoFromJson(json);
            var id = root.GetProperty("id").GetGuid();

            Assert.Equal(iso, returnedIso);

            return (id, returnedIso);
        }

        // ===================== GET ALL =======================

        [Fact]
        public async Task GetAll_ShouldReturnOkAndList_FromRealSystem()
        {
            // Guarantee at least one container in DB
            await CreateContainerAsync(IsoForAll);

            var response = await _client.GetAsync("/api/Container");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            Assert.Equal(JsonValueKind.Array, root.ValueKind);
            Assert.True(root.GetArrayLength() > 0);
        }

        // ===================== GET BY ID =====================

        [Fact]
        public async Task GetById_ShouldReturnOk_WhenContainerExists()
        {
            var (id, iso) = await CreateContainerAsync(IsoForById);

            var response = await _client.GetAsync($"/api/Container/id/{id}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var returnedIso = ExtractIsoFromJson(json);

            Assert.Equal(iso, returnedIso);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenContainerDoesNotExist()
        {
            var randomId = Guid.NewGuid();

            var response = await _client.GetAsync($"/api/Container/id/{randomId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("No Container Found", body);
        }

        // ===================== GET BY ISO ====================

        [Fact]
        public async Task GetByIso_ShouldReturnOk_WhenContainerExists()
        {
            await CreateContainerAsync("OOLU9354189", "GetByIso test");

            var response = await _client.GetAsync($"/api/Container/iso/{IsoForAll}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var returnedIso = ExtractIsoFromJson(json);

            Assert.Equal(IsoForAll, returnedIso);
        }

        [Fact]
        public async Task GetByIso_ShouldReturnNotFound_WhenIsoFormatIsInvalid()
        {
            var response = await _client.GetAsync("/api/Container/iso/INVALID");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("ISO 6346", body, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task GetByIso_ShouldReturnNotFound_WhenContainerDoesNotExist()
        {
            var response = await _client.GetAsync($"/api/Container/iso/{IsoForMissing}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("No Container Found", body);
        }

        // ===================== POST CREATE ===================

        [Fact]
        public async Task Create_ShouldReturnCreated_AndPersistContainer()
        {
            const string iso = "TRIU5443935"; // também é usado noutros testes como válido

            var dto = new CreatingContainerDto(
                iso,
                "New container created in system test",
                ContainerType.Electronic,
                15000
            );

            var response = await _client.PostAsJsonAsync("/api/Container", dto);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var returnedIso = ExtractIsoFromJson(json);
            Assert.Equal(iso, returnedIso);

            // Confirm via GET
            var getResponse = await _client.GetAsync($"/api/Container/iso/{iso}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenIsoDuplicate()
        {

            // Primeiro create (esperamos Created)
            await CreateContainerAsync("MSCU9560872","first instance");

            // Segundo create → deve falhar com 400
            var dto = new CreatingContainerDto(
                "MSCU9560872",
                "Duplicate container",
                ContainerType.General,
                10000
            );

            var response = await _client.PostAsJsonAsync("/api/Container", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("already exists", body);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenIsoFormatInvalid()
        {
            var dto = new CreatingContainerDto(
                "BADCODE",
                "Invalid ISO format",
                ContainerType.General,
                5000
            );

            var response = await _client.PostAsJsonAsync("/api/Container", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("ISO 6346", body, StringComparison.OrdinalIgnoreCase);
        }

        // ===================== PATCH UPDATE ==================

        [Fact]
        public async Task Patch_ShouldReturnOk_WhenValidChanges()
        {
            var (id, iso) = await CreateContainerAsync(
                "TEMU9502962","Old description",
                ContainerType.General,
                10000
            );

            var patch = new UpdatingContainerDto(
                description: "Updated from system test",
                type: ContainerType.Reefer,
                status: ContainerStatus.Full,
                weightKg: 15000
            );

            var response = await _client.PatchAsJsonAsync($"/api/Container/update/TEMU9502962", patch);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var returnedIso = ExtractIsoFromJson(json);
            var desc = ExtractStringProp(json, "description");

            Assert.Equal(iso, returnedIso);
            Assert.Equal("Updated from system test", desc);
        }

        [Fact]
        public async Task Patch_ShouldReturnBadRequest_WhenNegativeWeight()
        {
            var (_, iso) = await CreateContainerAsync(
                "MSCU2820896",
                "Will try invalid patch",
                ContainerType.General,
                1000
            );

            var patch = new UpdatingContainerDto(
                description: null,
                type: null,
                status: null,
                weightKg: -1
            );

            var response = await _client.PatchAsJsonAsync($"/api/Container/update/{iso}", patch);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("Weight of container must be greater", body);
        }

        [Fact]
        public async Task Patch_ShouldReturnBadRequest_WhenContainerNotFound()
        {
            var patch = new UpdatingContainerDto(
                description: "Does not matter",
                type: ContainerType.General,
                status: ContainerStatus.Full,
                weightKg: 1000
            );

            var response = await _client.PatchAsJsonAsync($"/api/Container/update/{IsoForMissing}", patch);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("No Container found", body);
        }

        [Fact]
        public async Task Patch_ShouldReturnBadRequest_WhenBodyNull()
        {
            // body vazio → model binding devolve dto = null → BadRequest("No changes provided.")
            var response = await _client.PatchAsync(
                $"/api/Container/update/{IsoForPatchOk}",
                new StringContent(string.Empty, System.Text.Encoding.UTF8, "application/json")
            );

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            Assert.Contains("No changes provided", body);
        }
    }
}
