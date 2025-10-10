using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;

namespace SEM5_PI_WEBAPI.Tests.Controllers
{
    public class StorageAreasControllerTests
    {
        private readonly Mock<IStorageAreaService> _serviceMock;
        private readonly StorageAreasController _controller;

        public StorageAreasControllerTests()
        {
            var loggerMock = new Mock<ILogger<StorageAreasController>>();
            _serviceMock = new Mock<IStorageAreaService>();
            _controller = new StorageAreasController(loggerMock.Object, _serviceMock.Object);
        }

        // 1. GET ALL

        [Fact]
        public async Task GetAllAsync_ShouldReturnOk_WhenStorageAreasExist()
        {
            var list = new List<StorageAreaDto>
            {
                new StorageAreaDto(Guid.NewGuid(), "Yard A", "Main yard", StorageAreaType.Yard,
                    2, 2, 2, 8, 0, new List<StorageAreaDockDistanceDto>(), new List<string> { "YC-0001" })
            };

            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

            var result = await _controller.GetAllAsync();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<StorageAreaDto>>(okResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("Yard A", returnValue[0].Name);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnNotFound_WhenNoStorageAreasExist()
        {
            _serviceMock.Setup(s => s.GetAllAsync()).ThrowsAsync(new BusinessRuleValidationException("No storage areas"));

            var result = await _controller.GetAllAsync();

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("No storage areas", notFound.Value);
        }

        // 2. GET BY ID

        [Fact]
        public async Task GetByIdAsync_ShouldReturnOk_WhenFound()
        {
            var dto = new StorageAreaDto(Guid.NewGuid(), "Yard A", "Main yard", StorageAreaType.Yard,
                2, 2, 2, 8, 0, new List<StorageAreaDockDistanceDto>(), new List<string>());

            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StorageAreaId>())).ReturnsAsync(dto);

            var result = await _controller.GetByIdAsync(dto.Id);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<StorageAreaDto>(okResult.Value);
            Assert.Equal(dto.Id, returnValue.Id);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNotFound_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetByIdAsync(Guid.NewGuid());

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Not found", notFound.Value);
        }

        // 3. GET BY NAME

        [Fact]
        public async Task GetByNameAsync_ShouldReturnOk_WhenFound()
        {
            var dto = new StorageAreaDto(Guid.NewGuid(), "Yard X", "desc", StorageAreaType.Yard,
                2, 2, 2, 8, 0, new(), new List<string> { "DC-0001" });

            _serviceMock.Setup(s => s.GetByNameAsync("Yard X")).ReturnsAsync(dto);

            var result = await _controller.GetByNameAsync("Yard X");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<StorageAreaDto>(okResult.Value);
            Assert.Equal("Yard X", returnValue.Name);
        }

        [Fact]
        public async Task GetByNameAsync_ShouldReturnNotFound_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetByNameAsync("Invalid"))
                .ThrowsAsync(new BusinessRuleValidationException("Storage Area with Name not found"));

            var result = await _controller.GetByNameAsync("Invalid");

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Storage Area with Name not found", notFound.Value);
        }

        // 4. GET DISTANCES TO DOCK

        [Fact]
        public async Task GetDistancesToDockAsync_ShouldReturnOk_WhenFound()
        {
            var distances = new List<StorageAreaDockDistanceDto>
            {
                new StorageAreaDockDistanceDto("DK-1111", 1.5f)
            };

            _serviceMock.Setup(s => s.GetDistancesToDockAsync("Yard X", null)).ReturnsAsync(distances);

            var result = await _controller.GetDistancesToDockAsync("Yard X", null);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<StorageAreaDockDistanceDto>>(okResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("DK-1111", returnValue[0].DockCode);
        }

        [Fact]
        public async Task GetDistancesToDockAsync_ShouldReturnNotFound_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetDistancesToDockAsync("Invalid", null))
                .ThrowsAsync(new BusinessRuleValidationException("Distances not found"));

            var result = await _controller.GetDistancesToDockAsync("Invalid", null);

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Distances not found", notFound.Value);
        }

        // 5. GET PHYSICAL RESOURCES

        [Fact]
        public async Task GetPhysicalResources_ShouldReturnOk_WhenFound()
        {
            var resources = new List<string> { "DC-0001", "YC-0002" };

            _serviceMock.Setup(s => s.GetPhysicalResourcesAsync("Yard A", null)).ReturnsAsync(resources);

            var result = await _controller.GetPhysicalResources("Yard A", null);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<string>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
            Assert.Contains("DC-0001", returnValue);
        }

        [Fact]
        public async Task GetPhysicalResources_ShouldReturnNotFound_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetPhysicalResourcesAsync("Invalid", null))
                .ThrowsAsync(new BusinessRuleValidationException("Physical resources not found"));

            var result = await _controller.GetPhysicalResources("Invalid", null);

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Physical resources not found", notFound.Value);
        }

        // 6. CREATE STORAGE AREA

        [Fact]
        public async Task CreateAsync_ShouldReturnCreatedAtRoute_WhenValid()
        {
            var dto = new CreatingStorageAreaDto(
                "Yard A", "desc", StorageAreaType.Yard, 2, 2, 2,
                new List<StorageAreaDockDistanceDto>(), new List<string> { "DC-0001" });

            var created = new StorageAreaDto(Guid.NewGuid(), "Yard A", "desc", StorageAreaType.Yard,
                2, 2, 2, 8, 0, new List<StorageAreaDockDistanceDto>(), new List<string> { "DC-0001" });

            _serviceMock.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

            var result = await _controller.CreateAsync(dto);

            var createdResult = Assert.IsType<CreatedAtRouteResult>(result.Result);
            Assert.Equal("GetStorageAreaById", createdResult.RouteName);
            var returnValue = Assert.IsType<StorageAreaDto>(createdResult.Value);
            Assert.Equal(created.Id, returnValue.Id);
        }

        [Fact]
        public async Task CreateAsync_ShouldReturnBadRequest_WhenBusinessRuleFails()
        {
            var dto = new CreatingStorageAreaDto(
                "Yard A", "desc", StorageAreaType.Yard, 2, 2, 2,
                new List<StorageAreaDockDistanceDto>(), new List<string>());

            _serviceMock.Setup(s => s.CreateAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid"));

            var result = await _controller.CreateAsync(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid", badRequest.Value);
        }
    }
}
