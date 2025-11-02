using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;
using SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs;
using SEM5_PI_WEBAPI.utils;

namespace SEM5_PI_WEBAPI.Tests.Integration
{
    public class VesselTypeServiceControllerTests
    {
        private readonly Mock<IVesselTypeRepository> _repoMock = new();
        private readonly Mock<IUnitOfWork> _uowMock = new();
        private readonly Mock<ILogger<VesselTypeService>> _serviceLogger = new();
        private readonly Mock<ILogger<VesselTypeController>> _controllerLogger = new();
        private readonly Mock<IResponsesToFrontend> _frontendMock = new();
        private readonly VesselTypeService _service;
        private readonly VesselTypeController _controller;

        public VesselTypeServiceControllerTests()
        {
            _frontendMock.Setup(x => x.ProblemResponse(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .Returns((string title, string detail, int status) =>
                    new ObjectResult(new ProblemDetails { Title = title, Detail = detail, Status = status })
                    {
                        StatusCode = status
                    });

            _service = new VesselTypeService(_uowMock.Object, _repoMock.Object, _serviceLogger.Object);
            _controller = new VesselTypeController(_service, _controllerLogger.Object, _frontendMock.Object);
        }

        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenVesselTypesExist()
        {
            var vesselList = new List<VesselType>
            {
                new VesselType("Cargo", 5, 10, 3, "Transport ships used worldwide"),
                new VesselType("Tanker", 4, 8, 2, "Oil transport ship type")
            };
            _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(vesselList);

            var result = await _controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsAssignableFrom<List<VesselTypeDto>>(ok.Value);
            Assert.Equal(2, data.Count);
            Assert.Contains(data, v => v.Name == "Cargo");
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenVesselTypeDoesNotExist()
        {
            var id = new VesselTypeId(Guid.NewGuid());
            _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((VesselType)null);

            var result = await _controller.GetById(id.AsGuid());

            var obj = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, obj.StatusCode);
            var details = Assert.IsType<ProblemDetails>(obj.Value);
            Assert.Equal("Not Found", details.Title);
        }

        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValidData()
        {
            var dto = new CreatingVesselTypeDto("Container", "Ship for global container shipping", 10, 8, 5);

            _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<VesselType>());
            _repoMock.Setup(r => r.AddAsync(It.IsAny<VesselType>()))
                     .ReturnsAsync((VesselType v) => v);
            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _controller.Create(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            var value = Assert.IsType<VesselTypeDto>(created.Value);
            Assert.Equal(dto.Name, value.Name);
            Assert.Equal(dto.MaxBays, value.MaxBays);
            Assert.Equal(dto.MaxRows, value.MaxRows);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenDuplicateName()
        {
            var dto = new CreatingVesselTypeDto("Cargo", "Repeated name test", 5, 5, 5);

            _repoMock.Setup(r => r.GetAllAsync())
                .ReturnsAsync(new List<VesselType> { new VesselType("Cargo", 4, 5, 5, "Existing ship") });

            var result = await _controller.Create(dto);

            var obj = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(400, obj.StatusCode);
            var problem = Assert.IsType<ProblemDetails>(obj.Value);
            Assert.Contains("exists", problem.Detail);
        }

        [Fact]
        public async Task Update_ShouldReturnOk_WhenDataIsValid()
        {
            var id = new VesselTypeId(Guid.NewGuid());
            var existing = new VesselType("Cargo", 5, 5, 5, "Cargo ship description");

            _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(existing);
            _repoMock.Setup(r => r.GetByNameAsync(It.IsAny<string>())).ReturnsAsync((VesselType)null);
            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var dto = new UpdateVesselTypeDto
            {
                Name = "UpdatedName",
                Description = "Updated description content",
                MaxBays = 6,
                MaxRows = 7,
                MaxTiers = 8
            };

            var result = await _controller.Update(id.AsGuid(), dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var updated = Assert.IsType<VesselTypeDto>(ok.Value);
            Assert.Equal("UpdatedName", updated.Name);
            Assert.Equal(dto.Description, updated.Description);
        }

        [Fact]
        public async Task Filter_ShouldReturnOk_WhenMatchesExist()
        {
            var vesselList = new List<VesselType>
            {
                new VesselType("Cargo", 5, 10, 3, "Global transport vessel")
            };
            _repoMock.Setup(r => r.FilterAsync("Cargo", null, null)).ReturnsAsync(vesselList);

            var result = await _controller.Filter("Cargo", null, null);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<List<VesselTypeDto>>(ok.Value);
            Assert.Single(data);
            Assert.Equal("Cargo", data[0].Name);
        }
    }
}
