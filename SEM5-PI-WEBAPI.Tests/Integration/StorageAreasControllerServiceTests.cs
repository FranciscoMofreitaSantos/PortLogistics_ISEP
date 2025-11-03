using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;
using SEM5_PI_WEBAPI.Tests.utils;
using SEM5_PI_WEBAPI.utils;

namespace SEM5_PI_WEBAPI.Tests.Integration
{
    public class StorageAreasControllerServiceTests
    {
        private readonly Mock<IStorageAreaService> _serviceMock = new();
        private readonly Mock<ILogger<StorageAreasController>> _loggerMock = new();
        private readonly IResponsesToFrontend _frontend;
        private readonly StorageAreasController _controller;

        public StorageAreasControllerServiceTests()
        {
            _frontend = FrontendMockHelper.MockFrontend();
            _controller = new StorageAreasController(_loggerMock.Object, _serviceMock.Object, _frontend);
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            _serviceMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<StorageAreaDto>
            {
                new StorageAreaDto(Guid.NewGuid(),"Area","D",StorageAreaType.Yard,1,1,1,1,0,new(),new())
            });

            var r = await _controller.GetAllAsync();
            Assert.IsType<OkObjectResult>(r.Result);
        }

        [Fact]
        public async Task GetAll_ReturnsProblem_WhenRuleBreak()
        {
            _serviceMock.Setup(x => x.GetAllAsync())
                .ThrowsAsync(new BusinessRuleValidationException("Not Found"));

            var r = await _controller.GetAllAsync();
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetById_ReturnsOk()
        {
            var id = Guid.NewGuid();
            var dto = new StorageAreaDto(id,"Area","D",StorageAreaType.Yard,1,1,1,1,0,new(),new());

            _serviceMock.Setup(x => x.GetByIdAsync(new StorageAreaId(id))).ReturnsAsync(dto);

            var r = await _controller.GetByIdAsync(id);
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            var value = Assert.IsType<StorageAreaDto>(ok.Value);
            Assert.Equal(id, value.Id);
        }

        [Fact]
        public async Task GetById_ReturnsProblem_IfNotFound()
        {
            _serviceMock.Setup(x => x.GetByIdAsync(It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var r = await _controller.GetByIdAsync(Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetByName_ReturnsProblem_IfNotFound()
        {
            _serviceMock.Setup(x => x.GetByNameAsync("X"))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var r = await _controller.GetByNameAsync("X");
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetByName_ReturnsOk_IfExists()
        {
            var dto = new StorageAreaDto(Guid.NewGuid(),"Area-X","D",StorageAreaType.Warehouse,1,1,1,1,0,new(),new());
            _serviceMock.Setup(x => x.GetByNameAsync("Area-X")).ReturnsAsync(dto);

            var r = await _controller.GetByNameAsync("Area-X");
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            var value = Assert.IsType<StorageAreaDto>(ok.Value);
            Assert.Equal("Area-X", value.Name);
        }

        [Fact]
        public async Task GetDistances_ReturnsOk()
        {
            var list = new List<StorageAreaDockDistanceDto>
            {
                new("DK-0001", 1.2f),
                new("DK-0002", 2.8f)
            };

            _serviceMock.Setup(x => x.GetDistancesToDockAsync("Area", null))
                .ReturnsAsync(list);

            var r = await _controller.GetDistancesToDockAsync("Area", null);
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            var value = Assert.IsType<List<StorageAreaDockDistanceDto>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetDistances_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(x => x.GetDistancesToDockAsync(null, It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var r = await _controller.GetDistancesToDockAsync(null, Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetPhysicalResources_ReturnsOk()
        {
            var list = new List<string> { "CRN-0001", "TRK-0002" };

            _serviceMock.Setup(x => x.GetPhysicalResourcesAsync("Area", null))
                .ReturnsAsync(list);

            var r = await _controller.GetPhysicalResources("Area", null);
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            var value = Assert.IsType<List<string>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetPhysicalResources_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(x => x.GetPhysicalResourcesAsync(It.IsAny<string>(), It.IsAny<StorageAreaId?>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var r = await _controller.GetPhysicalResources("X", null);
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsCreated()
        {
            var dto = new CreatingStorageAreaDto("A","B",StorageAreaType.Warehouse,1,1,1,new(),new());
            var returned = new StorageAreaDto(Guid.NewGuid(),"A","B",StorageAreaType.Warehouse,1,1,1,1,0,new(),new());

            _serviceMock.Setup(x => x.CreateAsync(dto)).ReturnsAsync(returned);

            var r = await _controller.CreateAsync(dto);
            Assert.IsType<CreatedAtRouteResult>(r.Result);
        }

        [Fact]
        public async Task Create_ReturnsProblem_WhenBusinessValidationFails()
        {
            var dto = new CreatingStorageAreaDto("A","B",StorageAreaType.Warehouse,1,1,1,new(),new());
            _serviceMock.Setup(x => x.CreateAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("duplicate"));

            var r = await _controller.CreateAsync(dto);
            var problem = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(400, problem.StatusCode);
        }

        [Fact]
        public async Task GetGrid_ReturnsData()
        {
            var id = Guid.NewGuid();
            var grid = new StorageAreaGridDto(1,1,1,new());
            _serviceMock.Setup(x => x.GetGridAsync(new StorageAreaId(id))).ReturnsAsync(grid);

            var r = await _controller.GetGrid(id);
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            Assert.IsType<StorageAreaGridDto>(ok.Value);
        }

        [Fact]
        public async Task GetGrid_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(x => x.GetGridAsync(It.IsAny<StorageAreaId>()))
                .ThrowsAsync(new BusinessRuleValidationException("not found"));

            var r = await _controller.GetGrid(Guid.NewGuid());
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }

        [Fact]
        public async Task GetContainerInPosition_ReturnsOk()
        {
            _serviceMock.Setup(x => x.GetContainerAsync(It.IsAny<StorageAreaId>(), 1, 2, 3))
                .ReturnsAsync(It.IsAny<ContainerDto>());

            var r = await _controller.GetContainerInPositionX(Guid.NewGuid(), 1, 2, 3);
            var ok = Assert.IsType<OkObjectResult>(r.Result);
            Assert.Null(ok.Value);
        }

        [Fact]
        public async Task GetContainerInPosition_ReturnsProblem_WhenNotFound()
        {
            _serviceMock.Setup(x => x.GetContainerAsync(It.IsAny<StorageAreaId>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ThrowsAsync(new BusinessRuleValidationException("No container"));

            var r = await _controller.GetContainerInPositionX(Guid.NewGuid(), 0, 0, 0);
            var resp = Assert.IsType<ObjectResult>(r.Result);
            Assert.Equal(404, resp.StatusCode);
        }
    }
}
