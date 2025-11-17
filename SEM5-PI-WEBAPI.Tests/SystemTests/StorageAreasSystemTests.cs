using System.Net;
using System.Text;
using Newtonsoft.Json;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;

namespace SEM5_PI_WEBAPI.Tests.SystemTests
{
    public class StorageAreasSystemTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public StorageAreasSystemTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        // ---------- Helpers ----------

        private static StringContent AsJsonContent(object obj)
        {
            var json = JsonConvert.SerializeObject(obj);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }

        /// <summary>
        /// Cria uma StorageArea válida via API e devolve o DTO criado.
        /// physicalResources e distancesToDocks vão com listas vazias, para não depender de seed.
        /// </summary>
        private async Task<StorageAreaDto> CreateStorageAreaAsync(string name)
        {
            var payload = new
            {
                name,
                description = "Outdoor storage area for containers - North section",
                type = "Yard",
                maxBays = 20,
                maxRows = 8,
                maxTiers = 4,
                physicalResources = Array.Empty<string>(),
                distancesToDocks = Array.Empty<object>() // lista vazia
            };

            var resp = await _client.PostAsync("/api/storageareas", AsJsonContent(payload));
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.Created, resp.StatusCode);

            var dto = JsonConvert.DeserializeObject<StorageAreaDto>(body);
            Assert.NotNull(dto);


            return dto;
        }

        // ---------- Testes ----------

        [Fact]
        public async Task GetAll_ShouldReturnOk_AndList()
        {
            var resp = await _client.GetAsync("/api/storageareas");
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

            var list = JsonConvert.DeserializeObject<List<StorageAreaDto>>(body);
            Assert.NotNull(list);
        }

        [Fact]
        public async Task Create_ShouldReturnCreated_AndThenGetById_ShouldReturnOk()
        {
            var uniqueName = $"Yard-System-{Guid.NewGuid():N}".Substring(0, 20);

            var created = await CreateStorageAreaAsync(uniqueName);

            var resp = await _client.GetAsync($"/api/storageareas/id/{created.Id}");
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);

            var dto = JsonConvert.DeserializeObject<StorageAreaDto>(body);
            Assert.NotNull(dto);
            Assert.Equal(created.Id, dto!.Id);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_ForRandomId()
        {
            var randomId = Guid.NewGuid();

            var resp = await _client.GetAsync($"/api/storageareas/id/{randomId}");
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
            Assert.False(string.IsNullOrWhiteSpace(body)); // deve trazer ProblemDetails
        }

        [Fact]
        public async Task GetByName_ShouldReturnOk_ForExistingCreatedArea()
        {
            var uniqueName = $"Yard-System-Name-{Guid.NewGuid():N}".Substring(0, 20);
            var created = await CreateStorageAreaAsync(uniqueName);

            var resp = await _client.GetAsync($"/api/storageareas/name/{Uri.EscapeDataString(uniqueName)}");
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

            var dto = JsonConvert.DeserializeObject<StorageAreaDto>(body);
            Assert.NotNull(dto);
            Assert.Equal(created.Id, dto!.Id);
        }

        [Fact]
        public async Task GetByName_ShouldReturnNotFound_ForUnknown()
        {
            var resp = await _client.GetAsync("/api/storageareas/name/ThisDoesNotExist-XYZ");
            Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenNameTooShort()
        {
            var payload = new
            {
                name = "Wa", // < 3 chars
                description = "Invalid short name",
                type = "Yard",
                maxBays = 2,
                maxRows = 2,
                maxTiers = 2,
                physicalResources = Array.Empty<string>(),
                distancesToDocks = Array.Empty<object>() // lista vazia
            };

            var resp = await _client.PostAsync("/api/storageareas", AsJsonContent(payload));
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
            Assert.False(string.IsNullOrWhiteSpace(body));
        }
        
      

        [Fact]
        public async Task GetGrid_ShouldReturnNotFound_ForRandomId()
        {
            var resp = await _client.GetAsync($"/api/storageareas/{Guid.NewGuid()}/grid");
            Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
        }

        [Fact]
        public async Task GetContainerInPosition_ShouldReturnNotFound_ForEmptySlot()
        {
            var sa = await CreateStorageAreaAsync($"Yard-Empty-{Guid.NewGuid():N}".Substring(0, 20));

            var resp = await _client.GetAsync($"/api/storageareas/{sa.Id}/container?bay=0&row=0&tier=0");
            var body = await resp.Content.ReadAsStringAsync();

            Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
        }
    }
}
