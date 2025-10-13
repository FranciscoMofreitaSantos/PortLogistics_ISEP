using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VVN;
using SEM5_PI_WEBAPI.Domain.VVN.DTOs;
using SEM5_PI_WEBAPI.Domain.VVN.Docs;
using SEM5_PI_WEBAPI.Domain.Dock;
using SEM5_PI_WEBAPI.Domain.Tasks;

namespace SEM5_PI_WEBAPI.Tests.Controllers
{
    public class VesselVisitNotificationControllerTests
    {
        private readonly Mock<IVesselVisitNotificationService> _serviceMock;
        private readonly Mock<ILogger<VesselVisitNotificationController>> _loggerMock;
        private readonly VesselVisitNotificationController _controller;

        public VesselVisitNotificationControllerTests()
        {
            _serviceMock = new Mock<IVesselVisitNotificationService>();
            _loggerMock = new Mock<ILogger<VesselVisitNotificationController>>();
            _controller = new VesselVisitNotificationController(_serviceMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnCreated_WhenValid()
        {
            var createDto = new CreatingVesselVisitNotificationDto(
                DateTime.Now.AddDays(1).ToString("O"),
                DateTime.Now.AddDays(2).ToString("O"),
                1200,
                "doc1.pdf",
                new List<string> { "DK-0001" },
                null,
                null,
                null,
                "IMO1234567"
            );

            var createdDto = new VesselVisitNotificationDto(
                id: Guid.NewGuid().ToString(),
                code: "2025-THPA-000001",
                estimatedTimeArrival: DateTime.Now.AddDays(1),
                estimatedTimeDeparture: DateTime.Now.AddDays(2),
                actualTimeArrival: null,
                actualTimeDeparture: null,
                acceptenceDate: null,
                volume: 1200,
                documents: new PdfDocumentCollection(),
                status: new Status(VvnStatus.InProgress, null).ToString(),
                docks: new List<DockDto>(),
                crewManifest: null,
                loadingCargoManifest: null,
                unloadingCargoManifest: null,
                imo: "IMO1234567",
                tasks: new List<TaskDto>()
            );

            _serviceMock.Setup(s => s.AddAsync(It.IsAny<CreatingVesselVisitNotificationDto>()))
                .ReturnsAsync(createdDto);

            var result = await _controller.CreateAsync(createDto);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(createdResult.Value);
            Assert.Equal(createdDto.Code, value.Code);
            Assert.Equal(createdDto.Volume, value.Volume);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnBadRequest_WhenBusinessRuleFails()
        {
            var dto = new CreatingVesselVisitNotificationDto(
                DateTime.Now.ToString("O"),
                DateTime.Now.AddDays(-1).ToString("O"),
                500,
                null,
                new List<string>(),
                null,
                null,
                null,
                "IMO1234567"
            );

            _serviceMock.Setup(s => s.AddAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid ETA/ETD"));

            var result = await _controller.CreateAsync(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid ETA/ETD", bad.Value);
        }

        [Fact]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            var id = Guid.NewGuid().ToString();
            var dto = BuildDto(id, "2025-THPA-000001", new Status(VvnStatus.InProgress, null));

            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ReturnsAsync(dto);

            var result = await _controller.GetById(Guid.Parse(id));

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(id, value.Id);
            Assert.Equal(VvnStatus.InProgress.ToString(), value.Status.Replace("Status: ", ""));

        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenNotExists()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetById(Guid.NewGuid());

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Not found", nf.Value);
        }

        [Fact]
        public async Task WithdrawById_ShouldReturnOk_WhenSuccess()
        {
            var id = Guid.NewGuid().ToString();
            var dto = BuildDto(id, "2025-THPA-000001", new Status(VvnStatus.Withdrawn, null));

            _serviceMock.Setup(s => s.WithdrawByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ReturnsAsync(dto);

            var result = await _controller.WithdrawByIdAsync(Guid.Parse(id));

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(VvnStatus.Withdrawn.ToString(),  value.Status.Replace("Status: ", ""));
        }

        [Fact]
        public async Task WithdrawById_ShouldReturnBadRequest_WhenBusinessFails()
        {
            _serviceMock.Setup(s => s.WithdrawByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Cannot withdraw"));

            var result = await _controller.WithdrawByIdAsync(Guid.NewGuid());

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Cannot withdraw", bad.Value);
        }

        [Fact]
        public async Task WithdrawById_ShouldReturn500_WhenUnexpectedError()
        {
            _serviceMock.Setup(s => s.WithdrawByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ThrowsAsync(new Exception("Unexpected"));

            var result = await _controller.WithdrawByIdAsync(Guid.NewGuid());

            var obj = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, obj.StatusCode);
        }

        [Fact]
        public async Task WithdrawByCode_ShouldReturnOk_WhenSuccess()
        {
            var dto = BuildDto(Guid.NewGuid().ToString(), "2025-THPA-000001", new Status(VvnStatus.Withdrawn, null));

            _serviceMock.Setup(s => s.WithdrawByCodeAsync(It.IsAny<VvnCode>()))
                .ReturnsAsync(dto);

            var result = await _controller.WithdrawByCodeAsync("2025-THPA-000001");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(VvnStatus.Withdrawn.ToString(),  value.Status.Replace("Status: ", ""));
        }

        [Fact]
        public async Task WithdrawByCode_ShouldReturnBadRequest_WhenRuleFails()
        {
            _serviceMock.Setup(s => s.WithdrawByCodeAsync(It.IsAny<VvnCode>()))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid code"));

            var result = await _controller.WithdrawByCodeAsync("2025-THPA-999999");

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid code", bad.Value);
        }

        [Fact]
        public async Task SubmitById_ShouldReturnOk_WhenSuccess()
        {
            var id = Guid.NewGuid().ToString();
            var dto = BuildDto(id, "2025-THPA-000001", new Status(VvnStatus.Submitted, null));

            _serviceMock.Setup(s => s.SubmitByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ReturnsAsync(dto);

            var result = await _controller.SubmitByIdAsync(Guid.Parse(id));

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(VvnStatus.Submitted.ToString(),  value.Status.Replace("Status: ", ""));
        }

        [Fact]
        public async Task SubmitById_ShouldReturnBadRequest_WhenRuleFails()
        {
            _serviceMock.Setup(s => s.SubmitByIdAsync(It.IsAny<VesselVisitNotificationId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid state"));

            var result = await _controller.SubmitByIdAsync(Guid.NewGuid());

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid state", bad.Value);
        }

        [Fact]
        public async Task SubmitByCode_ShouldReturnOk_WhenSuccess()
        {
            var dto = BuildDto(Guid.NewGuid().ToString(), "2025-THPA-000001", new Status(VvnStatus.Submitted, null));

            _serviceMock.Setup(s => s.SubmitByCodeAsync(It.IsAny<VvnCode>()))
                .ReturnsAsync(dto);

            var result = await _controller.SubmitByCodeAsync("2025-THPA-000001");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(VvnStatus.Submitted.ToString(), value.Status.Replace("Status: ", ""));
        }

        [Fact]
        public async Task SubmitByCode_ShouldReturnBadRequest_WhenInvalid()
        {
            _serviceMock.Setup(s => s.SubmitByCodeAsync(It.IsAny<VvnCode>()))
                .ThrowsAsync(new BusinessRuleValidationException("Cannot submit"));

            var result = await _controller.SubmitByCodeAsync("2025-THPA-999999");

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Cannot submit", bad.Value);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnOk_WhenValid()
        {
            var id = Guid.NewGuid();
            var updateDto = new UpdateVesselVisitNotificationDto
            {
                EstimatedTimeArrival = DateTime.Now.AddDays(3).ToString(),
                EstimatedTimeDeparture = DateTime.Now.AddDays(4).ToString(),
                Volume = 2000
            };

            var updated = BuildDto(id.ToString(), "2025-THPA-000001", new Status(VvnStatus.InProgress, null), 2000);

            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<VesselVisitNotificationId>(), updateDto))
                .ReturnsAsync(updated);

            var result = await _controller.UpdateAsync(id, updateDto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselVisitNotificationDto>(ok.Value);
            Assert.Equal(2000, value.Volume);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnBadRequest_WhenInvalid()
        {
            var dto = new UpdateVesselVisitNotificationDto();

            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<VesselVisitNotificationId>(), dto))
                .ThrowsAsync(new BusinessRuleValidationException("Cannot update"));

            var result = await _controller.UpdateAsync(Guid.NewGuid(), dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Cannot update", bad.Value);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturn500_WhenUnexpected()
        {
            var dto = new UpdateVesselVisitNotificationDto();

            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<VesselVisitNotificationId>(), dto))
                .ThrowsAsync(new Exception("Internal"));

            var result = await _controller.UpdateAsync(Guid.NewGuid(), dto);

            var obj = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, obj.StatusCode);
        }

        private static VesselVisitNotificationDto BuildDto(string id, string code, Status status, int volume = 1000)
        {
            return new VesselVisitNotificationDto(
                id,
                code,
                DateTime.Now.AddDays(1),
                DateTime.Now.AddDays(2),
                null,
                null,
                null,
                volume,
                new PdfDocumentCollection(),
                status.ToString(),
                new List<DockDto>(),
                null,
                null,
                null,
                "IMO1234567",
                new List<TaskDto>()
            );
        }
    }
}
