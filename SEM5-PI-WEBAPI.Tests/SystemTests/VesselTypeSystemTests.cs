using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;

namespace SEM5_PI_WEBAPI.Tests.SystemTests
{
    // SUT = sistema: WebAPI completa (Startup + Controllers + Services + Repos + EF InMemory)
    public class VesselTypeSystemTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public VesselTypeSystemTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        // ---------- HELPERS ----------

        private static string UniqueName(string prefix = "VT") =>
            $"{prefix}-{Guid.NewGuid():N}";

        private async Task<VesselTypeDto> CreateVesselTypeAsync(
            string? name = null,
            string description = "System test vessel type description",
            int maxBays = 10,
            int maxRows = 8,
            int maxTiers = 6)
        {
            var dto = new CreatingVesselTypeDto(
                name ?? UniqueName(),
                description,
                maxBays,
                maxRows,
                maxTiers);

            var response = await _client.PostAsJsonAsync("/api/VesselType", dto);

            // Não usar EnsureSuccessStatusCode porque nalguns testes queremos 400
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var created = await response.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(created);
            Assert.False(created!.Id == Guid.Empty);
            Assert.Equal(dto.Name, created.Name);

            return created!;
        }

        private static async Task<ProblemDetails?> ReadProblemDetailsAsync(HttpResponseMessage response)
        {
            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
            return problem;
        }

        // ---------- GET ALL ----------

        [Fact]
        public async Task GetAll_ShouldReturnOkAndList_FromRealSystem()
        {
            // Act
            var response = await _client.GetAsync("/api/VesselType");

            // Assert camada HTTP
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadFromJsonAsync<List<VesselTypeDto>>();
            Assert.NotNull(body);
            Assert.NotEmpty(body!); // pelo menos o InitialCargo do seed
        }

        // ---------- GET BY ID ----------

        [Fact]
        public async Task GetById_ShouldReturnOk_WhenVesselTypeExists()
        {
            // Arrange: criar via POST
            var created = await CreateVesselTypeAsync();

            // Act
            var response = await _client.GetAsync($"/api/VesselType/id/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var dto = await response.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(dto);
            Assert.Equal(created.Id, dto!.Id);
            Assert.Equal(created.Name, dto.Name);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenVesselTypeDoesNotExist()
        {
            var randomId = Guid.NewGuid();

            var response = await _client.GetAsync($"/api/VesselType/id/{randomId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // ---------- GET BY NAME ----------

        [Fact]
        public async Task GetByName_ShouldReturnOk_WhenVesselTypeExists()
        {
            var name = UniqueName("Panamax");
            var created = await CreateVesselTypeAsync(name);

            var response = await _client.GetAsync($"/api/VesselType/name/{created.Name}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var dto = await response.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(dto);
            Assert.Equal(created.Name, dto!.Name);
        }

        [Fact]
        public async Task GetByName_ShouldReturnNotFound_WhenVesselTypeDoesNotExist()
        {
            var response = await _client.GetAsync("/api/VesselType/name/NameThatDoesNotExist-XYZ");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // ---------- GET BY DESCRIPTION ----------

        [Fact]
        public async Task GetByDescription_ShouldReturnList_WhenMatchesExist()
        {
            var description = "System test shared description";

            await CreateVesselTypeAsync(UniqueName("TypeA"), description);
            await CreateVesselTypeAsync(UniqueName("TypeB"), description);

            var encodedDesc = Uri.EscapeDataString(description);
            var response = await _client.GetAsync($"/api/VesselType/description/{encodedDesc}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<VesselTypeDto>>();
            Assert.NotNull(list);
            Assert.True(list!.Count >= 2);
            Assert.Contains(list, v => v.Description == description);
        }

        [Fact]
        public async Task GetByDescription_ShouldReturnNotFound_WhenNoMatches()
        {
            var response = await _client.GetAsync("/api/VesselType/description/desc-that-does-not-exist-xyz");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }

        // ---------- FILTER ----------

        [Fact]
        public async Task Filter_ByName_ShouldReturnMatchingTypes()
        {
            var uniqueName = UniqueName("FilterName");
            await CreateVesselTypeAsync(uniqueName);

            var response = await _client.GetAsync($"/api/VesselType/filter?name={uniqueName}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<VesselTypeDto>>();
            Assert.NotNull(list);
            Assert.Contains(list!, v => v.Name == uniqueName);
        }

        [Fact]
        public async Task Filter_ByDescription_ShouldReturnMatchingTypes()
        {
            var description = "Filter description for system tests";
            await CreateVesselTypeAsync(UniqueName("FD1"), description);

            var encoded = Uri.EscapeDataString(description);
            var response = await _client.GetAsync($"/api/VesselType/filter?description={encoded}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<VesselTypeDto>>();
            Assert.NotNull(list);
            Assert.Contains(list!, v => v.Description == description);
        }

        [Fact]
        public async Task Filter_ByQuery_ShouldReturnMatchingTypes()
        {
            var name = "QuerySearchName-" + Guid.NewGuid().ToString("N")[..6];
            await CreateVesselTypeAsync(name);

            var response = await _client.GetAsync($"/api/VesselType/filter?query=QuerySearchName");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var list = await response.Content.ReadFromJsonAsync<List<VesselTypeDto>>();
            Assert.NotNull(list);
            Assert.Contains(list!, v => v.Name.StartsWith("QuerySearchName"));
        }

        [Fact]
        public async Task Filter_ShouldReturnValidationError_WhenNoMatches()
        {
            var response = await _client.GetAsync("/api/VesselType/filter?name=DefinitelyNotExistingName-XYZ");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        // ---------- POST (CREATE) ----------

        [Fact]
        public async Task Create_Then_GetById_ShouldWork_ThroughHttp()
        {
            var dto = new CreatingVesselTypeDto(
                "SystemTestType",
                "Vessel type created in system test",
                12, 10, 8);

            var postResponse = await _client.PostAsJsonAsync("/api/VesselType", dto);
            Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

            var created = await postResponse.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(created);
            Assert.Equal("SystemTestType", created!.Name);

            var getResponse = await _client.GetAsync($"/api/VesselType/id/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            var fetched = await getResponse.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(fetched);
            Assert.Equal("SystemTestType", fetched!.Name);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenDomainValidationFails_DescriptionTooShort()
        {
            var invalidDto = new CreatingVesselTypeDto(
                "BadType",
                "short", // < 10 chars viola regra de domínio
                5, 5, 5);

            var response = await _client.PostAsJsonAsync("/api/VesselType", invalidDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenDuplicateName()
        {
            var name = UniqueName("DupName");

            await CreateVesselTypeAsync(name);

            var duplicateDto = new CreatingVesselTypeDto(
                name,
                "Another description for duplicate test",
                10, 8, 6);

            var response = await _client.PostAsJsonAsync("/api/VesselType", duplicateDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
            Assert.Contains("already exists", problem!.Detail);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenInvalidDimensions()
        {
            var invalidDto = new CreatingVesselTypeDto(
                "InvalidDimensions",
                "Description for invalid dims",
                -1, 0, -5);

            var response = await _client.PostAsJsonAsync("/api/VesselType", invalidDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        // ---------- PUT (UPDATE) ----------

        [Fact]
        public async Task Update_ShouldReturnOk_WhenValidChanges()
        {
            var created = await CreateVesselTypeAsync();

            var updateDto = new UpdateVesselTypeDto
            {
                Description = "Updated description for system test",
                MaxBays = created.MaxBays + 2,
                MaxRows = created.MaxRows + 1,
                MaxTiers = created.MaxTiers + 1
            };

            var response = await _client.PutAsJsonAsync($"/api/VesselType/{created.Id}", updateDto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var updated = await response.Content.ReadFromJsonAsync<VesselTypeDto>();
            Assert.NotNull(updated);
            Assert.Equal(updateDto.Description, updated!.Description);
            Assert.Equal(updateDto.MaxBays, updated.MaxBays);
            Assert.Equal(updateDto.MaxRows, updated.MaxRows);
            Assert.Equal(updateDto.MaxTiers, updated.MaxTiers);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenNameAlreadyExists()
        {
            var first = await CreateVesselTypeAsync(UniqueName("BaseName"));
            var second = await CreateVesselTypeAsync(UniqueName("OtherName"));

            var updateDto = new UpdateVesselTypeDto
            {
                Name = first.Name // tentar meter o nome de outro VT
            };

            var response = await _client.PutAsJsonAsync($"/api/VesselType/{second.Id}", updateDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
            Assert.Contains("already exists", problem!.Detail);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenInvalidDimensions()
        {
            var created = await CreateVesselTypeAsync();

            var updateDto = new UpdateVesselTypeDto
            {
                MaxBays = -10,
                MaxRows = -5,
                MaxTiers = -3
            };

            var response = await _client.PutAsJsonAsync($"/api/VesselType/{created.Id}", updateDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenIdDoesNotExist()
        {
            var randomId = Guid.NewGuid();
            var updateDto = new UpdateVesselTypeDto
            {
                Description = "Attempting to update non-existing VT"
            };

            var response = await _client.PutAsJsonAsync($"/api/VesselType/{randomId}", updateDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Validation Error", problem!.Title);
        }

        // ---------- DELETE ----------

        [Fact]
        public async Task Delete_ShouldReturnOk_WhenVesselTypeExists()
        {
            var created = await CreateVesselTypeAsync();

            var response = await _client.DeleteAsync($"/api/VesselType/{created.Id}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var msg = await response.Content.ReadAsStringAsync();
            Assert.Contains(created.Id.ToString(), msg);

            var getAfterDelete = await _client.GetAsync($"/api/VesselType/id/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getAfterDelete.StatusCode);
        }

        [Fact]
        public async Task Delete_ShouldReturnNotFound_WhenVesselTypeDoesNotExist()
        {
            var randomId = Guid.NewGuid();

            var response = await _client.DeleteAsync($"/api/VesselType/{randomId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

            var problem = await ReadProblemDetailsAsync(response);
            Assert.NotNull(problem);
            Assert.Equal("Not Found", problem!.Title);
        }
    }
}
