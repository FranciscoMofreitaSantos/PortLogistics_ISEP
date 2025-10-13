using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Tests.Controllers
{
    public class ContainerControllerTests
    {
        private readonly Mock<IContainerService> _serviceMock;
        private readonly Mock<ILogger<ContainerController>> _loggerMock;
        private readonly ContainerController _controller;

        public ContainerControllerTests()
        {
            _serviceMock = new Mock<IContainerService>();
            _loggerMock = new Mock<ILogger<ContainerController>>();
            _controller = new ContainerController(_serviceMock.Object, _loggerMock.Object);
        }

        private static ContainerDto BuildDto(
            string iso = "MSCU6639870",
            string desc = "General cargo container",
            ContainerType type = ContainerType.General,
            ContainerStatus status = ContainerStatus.Empty,
            double weight = 1500) =>
            new ContainerDto(Guid.NewGuid(), new(iso), desc, type, status, weight);


        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenFound()
        {
            var list = new List<ContainerDto> { BuildDto(), BuildDto("CSQU3054383", "Reefer") };
            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

            var result = await _controller.GetAllAsync();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<List<ContainerDto>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetAll_ShouldReturnNotFound_WhenBusinessRuleFails()
        {
            _serviceMock.Setup(s => s.GetAllAsync())
                .ThrowsAsync(new BusinessRuleValidationException("No containers found"));

            var result = await _controller.GetAllAsync();

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("No containers found", nf.Value);
        }


        [Fact]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            var dto = BuildDto();
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<ContainerId>())).ReturnsAsync(dto);

            var result = await _controller.GetById(Guid.NewGuid());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var returned = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal(dto.IsoCode.Value, returned.IsoCode.Value);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<ContainerId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Missing"));

            var result = await _controller.GetById(Guid.NewGuid());

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Missing", nf.Value);
        }


        [Fact]
        public async Task GetByIso_ShouldReturnOk_WhenFound()
        {
            var dto = BuildDto("MSCU6639870", "Found container");
            _serviceMock.Setup(s => s.GetByIsoAsync("MSCU6639870")).ReturnsAsync(dto);

            var result = await _controller.GetById("MSCU6639870");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var returned = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal("MSCU6639870", returned.IsoCode.Value);
        }

        [Fact]
        public async Task GetByIso_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByIsoAsync("UNKNOWN"))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetById("UNKNOWN");

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Not found", nf.Value);
        }


        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValid()
        {
            var dto = new CreatingContainerDto("MSCU6639870", "Electronics container", ContainerType.Electronic, 900);
            var created = BuildDto("MSCU6639870", dto.Description, dto.Type, ContainerStatus.Empty, dto.WeightKg);

            _serviceMock.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

            var result = await _controller.CreateAsync(dto);

            var createdRes = Assert.IsType<CreatedAtActionResult>(result.Result);
            var value = Assert.IsType<ContainerDto>(createdRes.Value);
            Assert.Equal(dto.IsoCode, value.IsoCode.Value);
            Assert.Equal(dto.Type, value.Type);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenInvalid()
        {
            var dto = new CreatingContainerDto("INVALIDCODE", "Invalid container", ContainerType.General, 1200);
            _serviceMock.Setup(s => s.CreateAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid container data"));

            var result = await _controller.CreateAsync(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid container data", bad.Value);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenDuplicateIso()
        {
            var dto = new CreatingContainerDto("MSCU1234567", "Duplicate", ContainerType.General, 1000);
            _serviceMock.Setup(s => s.CreateAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Duplicate ISO code"));

            var result = await _controller.CreateAsync(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Duplicate ISO code", bad.Value);
        }


        [Fact]
        public async Task Update_ShouldReturnOk_WhenValid()
        {
            var iso = "MSCU6639870";
            var dto = new UpdatingContainerDto("Updated description", ContainerType.Reefer, ContainerStatus.Full, 1800);
            var updated = BuildDto(iso, "Updated description", ContainerType.Reefer, ContainerStatus.Full, 1800);

            _serviceMock.Setup(s => s.PatchByIsoAsync(iso, dto)).ReturnsAsync(updated);

            var result = await _controller.UpdateAsync(iso, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<ContainerDto>(ok.Value);
            Assert.Equal(iso, value.IsoCode.Value);
            Assert.Equal(ContainerType.Reefer, value.Type);
            Assert.Equal(ContainerStatus.Full, value.Status);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenInvalid()
        {
            var iso = "MSCU0000002";
            var dto = new UpdatingContainerDto(null, null, null, -1);
            _serviceMock.Setup(s => s.PatchByIsoAsync(iso, dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid weight"));

            var result = await _controller.UpdateAsync(iso, dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid weight", bad.Value);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenDtoIsNull()
        {
            var result = await _controller.UpdateAsync("MSCU0000010", null);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No changes provided.", bad.Value);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenContainerNotFound()
        {
            var iso = "MSCU9999999";
            var dto = new UpdatingContainerDto("Desc", ContainerType.General, ContainerStatus.Full, 1000);

            _serviceMock.Setup(s => s.PatchByIsoAsync(iso, dto))
                .ThrowsAsync(new BusinessRuleValidationException("No Container found with ISO MSCU9999999."));

            var result = await _controller.UpdateAsync(iso, dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("No Container found with ISO MSCU9999999.", bad.Value);
        }
    }
}
