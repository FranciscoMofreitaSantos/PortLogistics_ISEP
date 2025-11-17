using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SEM5_PI_WEBAPI.Domain.Vessels.DTOs;
using SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;
using Xunit;

namespace SEM5_PI_WEBAPI.Tests.SystemTests
{
    /// <summary>
    /// Testes funcionais de caixa opaca – SUT = sistema completo (Program + Startup + Controllers + Services + Repos + EF InMemory)
    /// Endpoint: /api/Vessel
    /// </summary>
    public class VesselSystemTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        // seed para gerar IMOs válidos (6 dígitos base -> calculamos check digit)
        private static int _imoSeed = 100000;

        public VesselSystemTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        // ---------- HELPERS ----------

        private static string Unique(string prefix)
            => $"{prefix}_{Guid.NewGuid():N}".Substring(0, 20);

        /// <summary>
        /// Gera um IMO válido com 7 dígitos, respeitando a regra do check digit
        /// </summary>
        private static string NextValidImo()
        {
            _imoSeed++;
            var sixDigits = _imoSeed.ToString("D6");

            var digits = sixDigits.Select(c => c - '0').ToArray();
            int checkDigit =
                (digits[0] * 7 +
                 digits[1] * 6 +
                 digits[2] * 5 +
                 digits[3] * 4 +
                 digits[4] * 3 +
                 digits[5] * 2) % 10;

            return sixDigits + checkDigit;
        }

        private static async Task<ProblemDetails?> ReadProblemDetailsAsync(HttpResponseMessage response)
        {
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ProblemDetails>(json);
        }

        /// <summary>
        /// Cria um VesselType via API e devolve o Name
        /// </summary>
        private async Task<string> CreateVesselTypeAsync(string? name = null)
        {
            var typeName = name ?? Unique("VT");

            var dto = new CreatingVesselTypeDto(
                nameIn: typeName,
                descriptionIn: "System test vessel type",
                maxBaysIn: 10,
                maxRowsIn: 8,
                maxTiersIn: 6
            );

            var response = await _client.PostAsJsonAsync("/api/VesselType", dto);

            if (response.StatusCode == HttpStatusCode.Created)
            {
                var json = await response.Content.ReadAsStringAsync();
                var created = JsonConvert.DeserializeObject<VesselTypeDto>(json);
                Assert.NotNull(created);
                return created!.Name;
            }

            // Se já existir com o mesmo nome, o serviço devolve 400; para o teste
            // tanto faz, o tipo já existe e o nome serve à mesma.
            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                return typeName;
            }

            Assert.True(false, $"Unexpected status when creating VesselType: {response.StatusCode}");
            return typeName;
        }

        /// <summary>
        /// Cria um Vessel via API e devolve o VesselDto (NÃO acede a ImoNumber.Value, para evitar NullReference)
        /// </summary>
        private async Task<VesselDto> CreateVesselAsync(
            string? imo = null,
            string? name = null,
            string? owner = null,
            string? vesselTypeName = null)
        {
            var chosenImo = imo ?? NextValidImo();
            var chosenName = name ?? Unique("VESSEL");
            var chosenOwner = owner ?? "System Owner Co.";
            var typeName = vesselTypeName ?? await CreateVesselTypeAsync();

            var dto = new CreatingVesselDto(
                imoNumber: chosenImo,
                name: chosenName,
                owner: chosenOwner,
                vesselTypeName: typeName
            );

            var response = await _client.PostAsJsonAsync("/api/Vessel", dto);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var created = JsonConvert.DeserializeObject<VesselDto>(json);

            Assert.NotNull(created);
            

            return created!;
        }

        // ========== TESTES ==========

        // 1. GET all vessels
        [Fact]
        public async Task GetAll_ShouldReturnOk_AndList()
        {
            // Arrange
            await CreateVesselAsync();
            await CreateVesselAsync();

            // Act
            var response = await _client.GetAsync("/api/Vessel");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var list = JsonConvert.DeserializeObject<List<VesselDto>>(json);

            Assert.NotNull(list);
            Assert.True(list!.Count >= 2);
        }

        // 2. GET by Id - válido
        [Fact]
        public async Task GetById_ShouldReturnOk_WhenExists()
        {
            // Arrange
            var vessel = await CreateVesselAsync();

            // Act
            var response = await _client.GetAsync($"/api/Vessel/id/{vessel.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var fetched = JsonConvert.DeserializeObject<VesselDto>(json);

            Assert.NotNull(fetched);
            Assert.Equal(vessel.Id, fetched!.Id);
            Assert.Equal(vessel.Name, fetched.Name);
        }

        // 3. GET by Id - não encontrado
        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenDoesNotExist()
        {
            var randomId = Guid.NewGuid();

            var response = await _client.GetAsync($"/api/Vessel/id/{randomId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // 4. GET by IMO - válido
        [Fact]
        public async Task GetByImo_ShouldReturnOk_WhenVesselExists()
        {
            const string imo = "9823455"; // IMO válido
            var created = await CreateVesselAsync(imo: imo, name: "Ever Majesty");

            var response = await _client.GetAsync($"/api/Vessel/imo/{imo}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var fetched = JsonConvert.DeserializeObject<VesselDto>(json);

            Assert.NotNull(fetched);
            Assert.Equal(created.Name, fetched!.Name);
            Assert.Equal(created.Owner, fetched.Owner);
        }

        // 5. GET by IMO - formato inválido
        [Fact]
        public async Task GetByImo_ShouldReturnNotFound_WhenFormatInvalid()
        {
            var response = await _client.GetAsync("/api/Vessel/imo/12345"); // formato inválido

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // 6. GET by Name - válido
        [Fact]
        public async Task GetByName_ShouldReturnOk_WhenVesselsExist()
        {
            var name = "Ever Majesty";
            var typeName = await CreateVesselTypeAsync();

            await CreateVesselAsync(name: name, owner: "Owner A", vesselTypeName: typeName);
            await CreateVesselAsync(name: name, owner: "Owner B", vesselTypeName: typeName);

            var response = await _client.GetAsync($"/api/Vessel/name/{Uri.EscapeDataString(name)}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var list = JsonConvert.DeserializeObject<List<VesselDto>>(json);

            Assert.NotNull(list);
            Assert.True(list!.Count >= 2);
        }

        // 7. GET by Name - não encontrado
        [Fact]
        public async Task GetByName_ShouldReturnNotFound_WhenNone()
        {
            var response = await _client.GetAsync("/api/Vessel/name/NonExistentVessel");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }



        // 9. GET by Owner - não encontrado
        [Fact]
        public async Task GetByOwner_ShouldReturnNotFound_WhenNone()
        {
            var response = await _client.GetAsync("/api/Vessel/owner/UnknownOwnerCo");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // 10. POST Create - válido
        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValid()
        {
            var typeName = await CreateVesselTypeAsync("Panamax Plus");
            var imo = "9872339"; // IMO válido

            var dto = new CreatingVesselDto(
                imoNumber: imo,
                name: "Ever Given",
                owner: "Evergreen Marine",
                vesselTypeName: typeName
            );

            var response = await _client.PostAsJsonAsync("/api/Vessel", dto);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var created = JsonConvert.DeserializeObject<VesselDto>(json);

            Assert.NotNull(created);
        }

        // 11. POST Create - IMO duplicado
        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenImoDuplicate()
        {
            var typeName = await CreateVesselTypeAsync("Panamax");
            const string imo = "9319466"; // IMO válido

            await CreateVesselAsync(imo: imo, owner: "Evergreen Marine", name: "First", vesselTypeName: typeName);

            var dto = new CreatingVesselDto(
                imoNumber: imo,
                name: "Duplicate Ever Given",
                owner: "Evergreen Marine",
                vesselTypeName: typeName
            );

            var response = await _client.PostAsJsonAsync("/api/Vessel", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
            Assert.Contains("already exists", problem.Detail);
        }

        // 12. POST Create - Nome vazio
        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenNameEmpty()
        {
            var typeName = await CreateVesselTypeAsync("Panamax Plus");
            var imo = "9999448"; // IMO válido

            var dto = new CreatingVesselDto(
                imoNumber: imo,
                name: "",
                owner: "NoName Shipping",
                vesselTypeName: typeName
            );

            var response = await _client.PostAsJsonAsync("/api/Vessel", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        // 13. POST Create - IMO formato inválido
        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenImoFormatInvalid()
        {
            var typeName = await CreateVesselTypeAsync("Panamax");

            var dto = new CreatingVesselDto(
                imoNumber: "12345",
                name: "Invalid IMO",
                owner: "Bad Company",
                vesselTypeName: typeName
            );

            var response = await _client.PostAsJsonAsync("/api/Vessel", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }
        

        // 15. GET filter - sem resultados
        [Fact]
        public async Task Filter_ShouldReturnNotFound_WhenNoMatches()
        {
            var response = await _client.GetAsync("/api/Vessel/filter?name=NotExistingType");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // 16. PATCH by IMO - válido
        [Fact]
        public async Task PatchByImo_ShouldReturnOk_WhenValidChanges()
        {
            var typeName = await CreateVesselTypeAsync();
            const string imo = "9234563"; // IMO válido

            var original = await CreateVesselAsync(
                imo: imo,
                name: "Ever Original",
                owner: "Evergreen Marine",
                vesselTypeName: typeName
            );

            var patch = new UpdatingVesselDto(
                name: "Ever Given Updated",
                ownerName: "Evergreen Marine Ltd"
            );

            var response = await _client.PatchAsJsonAsync($"/api/Vessel/imo/{imo}", patch);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            var updated = JsonConvert.DeserializeObject<VesselDto>(json);

            Assert.NotNull(updated);
        }

        // 17. PATCH by IMO - Vessel não existe
        [Fact]
        public async Task PatchByImo_ShouldReturnValidationError_WhenVesselDoesNotExist()
        {
            var patch = new UpdatingVesselDto(
                name: "Ghost Vessel",
                ownerName: "NonExistent Owner"
            );

            // IMO válido mas não existente na BD
            const string imo = "9399234";

            var response = await _client.PatchAsJsonAsync($"/api/Vessel/imo/{imo}", patch);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
            Assert.Contains("No Vessel found with IMO", problem.Detail);
        }

        // 18. PATCH by IMO - dados inválidos (nome demasiado curto)
        [Fact]
        public async Task PatchByImo_ShouldReturnValidationError_WhenNameTooShort()
        {
            var typeName = await CreateVesselTypeAsync();
            const string imo = "9399014"; // IMO válido

            await CreateVesselAsync(
                imo: imo,
                name: "MSC Gulsun",
                owner: "Mediterranean Shipping Company",
                vesselTypeName: typeName
            );

            var patch = new UpdatingVesselDto(
                name: "X", // inválido: < MinNameLength = 5
                ownerName: "Evergreen Marine Ltd"
            );

            var response = await _client.PatchAsJsonAsync($"/api/Vessel/imo/{imo}", patch);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }
    }
}
