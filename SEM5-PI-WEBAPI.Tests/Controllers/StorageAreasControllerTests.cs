using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;
using SEM5_PI_WEBAPI.utils;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEM5_PI_WEBAPI.Tests.Controllers
{
    public class StorageAreasControllerTests
    {
        private readonly Mock<IStorageAreaService> _serviceMock;
        private readonly IResponsesToFrontend _frontend;
        private readonly StorageAreasController _controller;

        public StorageAreasControllerTests()
        {
            var loggerMock = new Mock<ILogger<StorageAreasController>>();
            _serviceMock = new Mock<IStorageAreaService>();
            _frontend = FrontendMockHelper.MockFrontend();

            _controller = new StorageAreasController(
                loggerMock.Object,
                _serviceMock.Object,
                _frontend
            );
        }

        [Fact]
        public async Task GetAllAsync_ReturnsOk_WhenDataExists()
        {
            var list = new List<StorageAreaDto>
            {
                new StorageAreaDto(
                    Guid.NewGuid(), "Yard A", "Main yard", StorageAreaType.Yard,
                    2, 2, 2, 8, 0, new(), new() { "YC-01" })
            };

            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

            var result = await _controller.GetAllAsync();
            var ok = Assert.IsType<OkObjectResult>(result.Result);

            var data = Assert.IsAssignableFrom<List<StorageAreaDto>>(ok.Value);
            Assert.Single(data);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsProblem_WhenEmptyOrRuleBreak()
        {
            _serviceMock.Setup(s => s.GetAllAsync())
                .ThrowsAsync(new BusinessRuleValidationException("No storage areas"));

            var result = await _controller.GetAllAsync();
            var resp = Assert.IsType<ObjectResult>(result.Result);

            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsOk_WhenExists()
        {
            var id = Guid.NewGuid();
            var dto = new StorageAreaDto(id, "SA-1", "Desc", StorageAreaType.Yard, 1, 1, 1, 1, 0, new(), new());

            _serviceMock.Setup(s => s.GetByIdAsync(new StorageAreaId(id)))
                .ReturnsAsync(dto);

            var result = await _controller.GetByIdAsync(id);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<StorageAreaDto>(ok.Value);
            Assert.Equal(id, value.Id);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetByIdAsync(Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetByNameAsync_ReturnsOk_WhenExists()
        {
            var dto = new StorageAreaDto(Guid.NewGuid(), "SA-X", "Desc", StorageAreaType.Warehouse, 2, 2, 2, 8, 0, new(), new());
            _serviceMock.Setup(s => s.GetByNameAsync("SA-X")).ReturnsAsync(dto);

            var result = await _controller.GetByNameAsync("SA-X");
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<StorageAreaDto>(ok.Value);
            Assert.Equal("SA-X", value.Name);
        }

        [Fact]
        public async Task GetByNameAsync_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetByNameAsync(It.IsAny<string>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var result = await _controller.GetByNameAsync("invalid");
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetDistancesToDockAsync_ReturnsOk_WhenExists()
        {
            var distances = new List<StorageAreaDockDistanceDto>
            {
                new("DK-0001", 1.2f),
                new("DK-0002", 2.5f)
            };

            _serviceMock.Setup(s => s.GetDistancesToDockAsync("Yard1", null))
                .ReturnsAsync(distances);

            var result = await _controller.GetDistancesToDockAsync("Yard1", null);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<List<StorageAreaDockDistanceDto>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetDistancesToDockAsync_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetDistancesToDockAsync(null, It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var result = await _controller.GetDistancesToDockAsync(null, Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetPhysicalResources_ReturnsOk_WhenExists()
        {
            var list = new List<string> { "CRN-0001", "TRK-0002" };
            _serviceMock.Setup(s => s.GetPhysicalResourcesAsync("YardRes", null))
                .ReturnsAsync(list);

            var result = await _controller.GetPhysicalResources("YardRes", null);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<List<string>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetPhysicalResources_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetPhysicalResourcesAsync(It.IsAny<string>(), null))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var result = await _controller.GetPhysicalResources("Invalid", null);
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task CreateAsync_ReturnsCreated_WhenValid()
        {
            var dto = new CreatingStorageAreaDto("A", "d", StorageAreaType.Yard, 1, 1, 1, new(), new());
            var created = new StorageAreaDto(Guid.NewGuid(), "A", "d", StorageAreaType.Yard, 1, 1, 1, 1, 0, new(), new());

            _serviceMock.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

            var response = await _controller.CreateAsync(dto);
            var res = Assert.IsType<CreatedAtRouteResult>(response.Result);
            Assert.Equal("GetStorageAreaById", res.RouteName);
        }

        [Fact]
        public async Task CreateAsync_ReturnsProblem_WhenBusinessFails()
        {
            var dto = new CreatingStorageAreaDto("A", "d", StorageAreaType.Yard, 1, 1, 1, new(), new());

            _serviceMock.Setup(s => s.CreateAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid"));

            var response = await _controller.CreateAsync(dto);
            var problem = Assert.IsType<ObjectResult>(response.Result);
            Assert.Equal(400, problem.StatusCode);
        }

        [Fact]
        public async Task GetGrid_ReturnsOk_WhenExists()
        {
            var id = Guid.NewGuid();
            var grid = new StorageAreaGridDto(2, 2, 2, new List<StorageSlotDto>
            { new StorageSlotDto(0, 0, 0, "TEST1234567") });

            _serviceMock.Setup(s => s.GetGridAsync(new StorageAreaId(id)))
                .ReturnsAsync(grid);

            var result = await _controller.GetGrid(id);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<StorageAreaGridDto>(ok.Value);
        }

        [Fact]
        public async Task GetGrid_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetGridAsync(It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetGrid(Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetContainerInPosition_ReturnsOk_WhenExists()
        {
            // Não assumimos a assinatura do ContainerDto; apenas validamos Ok.
            _serviceMock.Setup(s => s.GetContainerAsync(It.IsAny<StorageAreaId>(), 1, 2, 3))
                .ReturnsAsync(It.IsAny<SEM5_PI_WEBAPI.Domain.Containers.DTOs.ContainerDto>());

            var result = await _controller.GetContainerInPositionX(Guid.NewGuid(), 1, 2, 3);
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Null(ok.Value);
        }

        [Fact]
        public async Task GetContainerInPosition_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(s => s.GetContainerAsync(It.IsAny<StorageAreaId>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var result = await _controller.GetContainerInPositionX(Guid.NewGuid(), 0, 0, 0);
            var resp = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(404, resp.StatusCode);
        }
    }
}
