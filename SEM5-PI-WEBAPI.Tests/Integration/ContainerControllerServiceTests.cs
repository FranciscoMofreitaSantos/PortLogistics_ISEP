using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.Integration
{
    public class ContainerControllerServiceTests
    {
        private readonly Mock<IContainerRepository> _containerRepoMock = new();
        private readonly Mock<IUnitOfWork> _uowMock = new();
        private readonly Mock<ILogger<ContainerService>> _serviceLogger = new();
        private readonly Mock<ILogger<ContainerController>> _controllerLogger = new();

        private readonly ContainerService _service;
        private readonly ContainerController _controller;

        public ContainerControllerServiceTests()
        {
            _service = new ContainerService(
                _uowMock.Object,
                _serviceLogger.Object,
                _containerRepoMock.Object
            );

            _controller = new ContainerController(_service, _controllerLogger.Object);
        }


        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenContainersExist()
        {
            var containers = new List<EntityContainer>
            {
                new EntityContainer("MSCU6639870", "General cargo container", ContainerType.General, 1500),
                new EntityContainer("CSQU3054383", "Reefer container for perishables", ContainerType.Reefer, 1800)
            };

            _containerRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(containers);

            var result = await _controller.GetAllAsync();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsAssignableFrom<List<ContainerDto>>(ok.Value);
            Assert.Equal(2, data.Count);
            Assert.Contains(data, c => c.IsoCode.Value == "MSCU6639870");
        }

        [Fact]
        public async Task GetAll_ShouldReturnNotFound_WhenNoContainers()
        {
            _containerRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<EntityContainer>());

            var result = await _controller.GetAllAsync();

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("No Vessel/s", notFound.Value!.ToString());
        }


        [Fact]
        public async Task GetById_ShouldReturnOk_WhenContainerExists()
        {
            var container = new EntityContainer("MSCU6639870", "Full cargo container", ContainerType.General, 1200);
            _containerRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<ContainerId>())).ReturnsAsync(container);

            var result = await _controller.GetById(container.Id.AsGuid());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal("MSCU6639870", dto.IsoCode.Value);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenDoesNotExist()
        {
            _containerRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<ContainerId>())).ReturnsAsync((EntityContainer)null);

            var result = await _controller.GetById(Guid.NewGuid());

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("No Container Found", notFound.Value!.ToString());
        }


        [Fact]
        public async Task GetByIso_ShouldReturnOk_WhenExists()
        {
            var container = new EntityContainer("MSCU6639870", "Test container", ContainerType.General, 1200);
            _containerRepoMock.Setup(r => r.GetByIsoNumberAsync(It.IsAny<Iso6346Code>())).ReturnsAsync(container);

            var result = await _controller.GetById("MSCU6639870");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal("MSCU6639870", dto.IsoCode.Value);
        }
        


        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValidData()
        {
            var dto = new CreatingContainerDto("MSCU6639870", "Electronics container", ContainerType.Electronic, 900);

            _containerRepoMock.Setup(r => r.GetByIsoNumberAsync(It.IsAny<Iso6346Code>()))
                              .ReturnsAsync((EntityContainer)null);

            _containerRepoMock.Setup(r => r.AddAsync(It.IsAny<EntityContainer>()))
                              .ReturnsAsync((EntityContainer c) => c);

            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _controller.CreateAsync(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            var value = Assert.IsType<ContainerDto>(created.Value);
            Assert.Equal(dto.IsoCode, value.IsoCode.Value);
            Assert.Equal(dto.Type, value.Type);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenIsoAlreadyExists()
        {
            var dto = new CreatingContainerDto("MSCU6639870", "Duplicate ISO", ContainerType.General, 1500);
            var existing = new EntityContainer("MSCU6639870", "Already exists", ContainerType.General, 1200);

            _containerRepoMock.Setup(r => r.GetByIsoNumberAsync(It.IsAny<Iso6346Code>())).ReturnsAsync(existing);

            var result = await _controller.CreateAsync(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("already exists", badRequest.Value!.ToString());
        }

        [Fact]
        public async Task Update_ShouldReturnOk_WhenValid()
        {
            var iso = "MSCU6639870";
            var dto = new UpdatingContainerDto("Updated description.", ContainerType.Reefer, ContainerStatus.Full, 2000);

            var container = new EntityContainer(iso, "Old description.", ContainerType.General, 1200);
            _containerRepoMock.Setup(r => r.GetByIsoNumberAsync(It.IsAny<Iso6346Code>())).ReturnsAsync(container);

            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _controller.UpdateAsync(iso, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal(ContainerStatus.Full, value.Status);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenInvalidIso()
        {
            var dto = new UpdatingContainerDto("Test", ContainerType.General, ContainerStatus.Empty, 100);
            var result = await _controller.UpdateAsync("INVALID", dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("ISO", bad.Value!.ToString(), StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenNotFound()
        {
            var iso = "MSCU6639870";
            var dto = new UpdatingContainerDto("New Desc", ContainerType.General, ContainerStatus.Full, 1500);

            _containerRepoMock.Setup(r => r.GetByIsoNumberAsync(It.IsAny<Iso6346Code>()))
                              .ReturnsAsync((EntityContainer)null);

            var result = await _controller.UpdateAsync(iso, dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("No Container found", bad.Value!.ToString());
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            var result = await _controller.UpdateAsync("MSCU9999999", null);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No changes provided.", bad.Value);
        }
    }
}
