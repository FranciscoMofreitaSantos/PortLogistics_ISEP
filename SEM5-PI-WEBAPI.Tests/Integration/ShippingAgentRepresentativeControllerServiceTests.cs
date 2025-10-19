using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives;
using SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VVN;

namespace SEM5_PI_WEBAPI.Tests.Integration
{
    public class ShippingAgentRepresentativeControllerTests
    {
        private readonly Mock<IShippingAgentRepresentativeService> _serviceMock = new();
        private readonly Mock<ILogger<ShippingAgentRepresentativeController>> _loggerMock = new();
        private readonly ShippingAgentRepresentativeController _controller;

        public ShippingAgentRepresentativeControllerTests()
        {
            _controller = new ShippingAgentRepresentativeController(_serviceMock.Object, _loggerMock.Object);
        }

        // ------------------- Positive Path Tests -------------------

        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenSARsExist()
        {
            var sarList = new List<ShippingAgentRepresentativeDto>
            {
                new ShippingAgentRepresentativeDto(
                    Guid.NewGuid(),
                    "John Doe",
                    new CitizenId("CIT123"),
                    Nationality.Portugal,
                    "john@example.com",
                    new PhoneNumber("+123456789"),
                    SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                    new ShippingOrganizationCode("0000000001"),
                    new List<VvnCode>()
                ),
                new ShippingAgentRepresentativeDto(
                    Guid.NewGuid(),
                    "Jane Smith",
                    new CitizenId("CIT456"),
                    Nationality.Spain,
                    "jane@example.com",
                    new PhoneNumber("+987654321"),
                    SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.deactivated,
                    new ShippingOrganizationCode("0000000002"),
                    new List<VvnCode>()
                )
            };

            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(sarList);

            var result = await _controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsAssignableFrom<List<ShippingAgentRepresentativeDto>>(ok.Value);
            Assert.Equal(2, data.Count);
            Assert.Contains(data, x => x.Name == "John Doe");
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenSARDoesNotExist()
        {
            var id = new ShippingAgentRepresentativeId(Guid.NewGuid());
            _serviceMock.Setup(s => s.GetByIdAsync(id)).ReturnsAsync((ShippingAgentRepresentativeDto)null);

            var result = await _controller.GetGetById(id.AsGuid());

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetByName_ShouldReturnOk_WhenSARExists()
        {
            var sar = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                "john@example.com",
                new PhoneNumber("+123456789"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                new ShippingOrganizationCode("0000000001"),
                new List<VvnCode>()
            );

            _serviceMock.Setup(s => s.GetByNameAsync("John Doe")).ReturnsAsync(sar);

            var result = await _controller.GetByNameAsync("John Doe");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(ok.Value);
            Assert.Equal("John Doe", data.Name);
        }

        [Fact]
        public async Task GetByEmail_ShouldReturnOk_WhenSARExists()
        {
            var sar = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                "john@example.com",
                new PhoneNumber("+123456789"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                new ShippingOrganizationCode("0000000001"),
                new List<VvnCode>()
            );

            _serviceMock.Setup(s => s.GetByEmailAsync("john@example.com")).ReturnsAsync(sar);

            var result = await _controller.GetByEmailAsync("john@example.com");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(ok.Value);
            Assert.Equal("john@example.com", data.Email);
        }

        [Fact]
        public async Task GetByStatus_ShouldReturnOk_WhenSARExists()
        {
            var sar = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                "john@example.com",
                new PhoneNumber("+123456789"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                new ShippingOrganizationCode("0000000001"),
                new List<VvnCode>()
            );

            _serviceMock.Setup(s => s.GetByStatusAsync(SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated))
                        .ReturnsAsync(sar);

            var result = await _controller.GetByStatusAsync(SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(ok.Value);
            Assert.Equal(SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated, data.Status);
        }

        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValidData()
        {
            var creatingDto = new CreatingShippingAgentRepresentativeDto(
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                "john@example.com",
                new PhoneNumber("+123456789"),
                "activated",
                "0000000001"
            );

            var createdDto = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                creatingDto.Name,
                creatingDto.CitizenId,
                creatingDto.Nationality,
                creatingDto.Email,
                creatingDto.PhoneNumber,
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                new ShippingOrganizationCode(creatingDto.Sao),
                new List<VvnCode>()
            );

            _serviceMock.Setup(s => s.AddAsync(creatingDto)).ReturnsAsync(createdDto);

            var result = await _controller.Create(creatingDto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(created.Value);
            Assert.Equal("John Doe", data.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnOk_WhenValidPatch()
        {
            var updatingDto = new UpdatingShippingAgentRepresentativeDto(
                "newemail@example.com",
                new PhoneNumber("+111111111"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.deactivated
            );

            var patchedDto = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                updatingDto.Email!,
                updatingDto.PhoneNumber!,
                updatingDto.Status!.Value,
                new ShippingOrganizationCode("0000000001"),
                new List<VvnCode>()
            );

            _serviceMock.Setup(s => s.PatchByNameAsync("John Doe", updatingDto)).ReturnsAsync(patchedDto);

            var result = await _controller.UpdateAsync("John Doe", updatingDto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(ok.Value);
            Assert.Equal("newemail@example.com", data.Email);
            Assert.Equal(SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.deactivated, data.Status);
        }

        [Fact]
        public async Task AddNotificationAsync_ShouldReturnOk_WhenValidData()
        {
            // Use valid VVN code format: yyyy-PORTCODE-nnnnnn
            var vvn = new VvnCode("2025-THPA-000001");

            var updatedDto = new ShippingAgentRepresentativeDto(
                Guid.NewGuid(),
                "John Doe",
                new CitizenId("CIT123"),
                Nationality.Portugal,
                "john@example.com",
                new PhoneNumber("+123456789"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.activated,
                new ShippingOrganizationCode("0000000001"),
                new List<VvnCode> { vvn }
            );

            _serviceMock.Setup(s => s.AddNotificationAsync("John Doe", "2025-THPA-000001")).ReturnsAsync(updatedDto);

            var result = await _controller.AddNotificationAsync("John Doe", "2025-THPA-000001");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<ShippingAgentRepresentativeDto>(ok.Value);
            Assert.Contains(data.Notifs, n => n.Code == "2025-THPA-000001");
        }

        // ------------------- Negative Path Tests -------------------

        [Fact]
        public async Task UpdateAsync_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            var result = await _controller.UpdateAsync("John Doe", null);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No changes provided.", badRequest.Value);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnBadRequest_WhenBusinessRuleViolationOccurs()
        {
            var updatingDto = new UpdatingShippingAgentRepresentativeDto(
                "invalidemail",
                new PhoneNumber("+111111111"),
                SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.Status.deactivated
            );

            _serviceMock.Setup(s => s.PatchByNameAsync("John Doe", updatingDto))
                        .ThrowsAsync(new BusinessRuleValidationException("Invalid email"));

            var result = await _controller.UpdateAsync("John Doe", updatingDto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Invalid email", badRequest.Value!.ToString());
        }

        [Fact]
        public async Task AddNotificationAsync_ShouldReturnBadRequest_WhenBusinessRuleViolationOccurs()
        {
            _serviceMock.Setup(s => s.AddNotificationAsync("John Doe", "INVALIDVVN"))
                        .ThrowsAsync(new BusinessRuleValidationException("VVN not found"));

            var result = await _controller.AddNotificationAsync("John Doe", "INVALIDVVN");

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("VVN not found", badRequest.Value!.ToString());
        }
    }
}
