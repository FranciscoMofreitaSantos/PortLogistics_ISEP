using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;
using SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs;

namespace SEM5_PI_WEBAPI.Tests.Controllers
{
    public class VesselTypeControllerTests
    {
        private readonly Mock<IVesselTypeService> _serviceMock;
        private readonly Mock<ILogger<VesselTypeController>> _loggerMock;
        private readonly VesselTypeController _controller;

        public VesselTypeControllerTests()
        {
            _serviceMock = new Mock<IVesselTypeService>();
            _loggerMock = new Mock<ILogger<VesselTypeController>>();
            _controller = new VesselTypeController(_serviceMock.Object, _loggerMock.Object);
        }

        private static VesselTypeDto BuildDto(string name = "Container Carrier") =>
            new VesselTypeDto(Guid.NewGuid(), name, "Description", 10, 8, 6, 480);

        
        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenFound()
        {
            var list = new List<VesselTypeDto> { BuildDto(), BuildDto("Bulk Carrier") };
            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

            var result = await _controller.GetAll();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<List<VesselTypeDto>>(ok.Value);
            Assert.Equal(2, value.Count);
        }

        [Fact]
        public async Task GetAll_ShouldReturnNotFound_WhenBusinessRuleFails()
        {
            _serviceMock.Setup(s => s.GetAllAsync()).ThrowsAsync(new BusinessRuleValidationException("No vessels"));

            var result = await _controller.GetAll();

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("No vessels", nf.Value);
        }


        [Fact]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            var dto = BuildDto();
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<VesselTypeId>())).ReturnsAsync(dto);

            var result = await _controller.GetById(Guid.NewGuid());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto.Name, ((VesselTypeDto)ok.Value).Name);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<VesselTypeId>()))
                .ThrowsAsync(new BusinessRuleValidationException("Missing"));

            var result = await _controller.GetById(Guid.NewGuid());

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Missing", nf.Value);
        }


        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValid()
        {
            var dto = new CreatingVesselTypeDto("Test", "desc", 10, 8, 6);
            var created = BuildDto("Test");
            _serviceMock.Setup(s => s.AddAsync(dto)).ReturnsAsync(created);

            var result = await _controller.Create(dto);

            var createdRes = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(created.Name, ((VesselTypeDto)createdRes.Value).Name);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenInvalid()
        {
            var dto = new CreatingVesselTypeDto("Bad", "desc", 1, 1, 1);
            _serviceMock.Setup(s => s.AddAsync(dto)).ThrowsAsync(new BusinessRuleValidationException("Invalid"));

            var result = await _controller.Create(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid", bad.Value);
        }


        [Fact]
        public async Task GetByName_ShouldReturnOk_WhenFound()
        {
            var dto = BuildDto("Cargo");
            _serviceMock.Setup(s => s.GetByNameAsync("Cargo")).ReturnsAsync(dto);

            var result = await _controller.GetByName("Cargo");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal("Cargo", ((VesselTypeDto)ok.Value).Name);
        }

        [Fact]
        public async Task GetByName_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByNameAsync("Missing"))
                .ThrowsAsync(new BusinessRuleValidationException("Not found"));

            var result = await _controller.GetByName("Missing");

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Not found", nf.Value);
        }

        
        [Fact]
        public async Task GetByDescription_ShouldReturnOk_WhenFound()
        {
            var list = new List<VesselTypeDto> { BuildDto("A"), BuildDto("B") };
            _serviceMock.Setup(s => s.GetByDescriptionAsync("desc")).ReturnsAsync(list);

            var result = await _controller.GetByDescription("desc");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(2, ((List<VesselTypeDto>)ok.Value).Count);
        }

        [Fact]
        public async Task GetByDescription_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByDescriptionAsync("desc"))
                .ThrowsAsync(new BusinessRuleValidationException("None"));

            var result = await _controller.GetByDescription("desc");

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("None", nf.Value);
        }


        [Fact]
        public async Task Filter_ShouldReturnOk_WhenFound()
        {
            var list = new List<VesselTypeDto> { BuildDto("A"), BuildDto("B") };
            _serviceMock.Setup(s => s.FilterAsync("A", null, null)).ReturnsAsync(list);

            var result = await _controller.Filter("A", null, null);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(2, ((List<VesselTypeDto>)ok.Value).Count);
        }

        [Fact]
        public async Task Filter_ShouldReturnNotFound_WhenNoResults()
        {
            _serviceMock.Setup(s => s.FilterAsync(null, null, null))
                .ThrowsAsync(new BusinessRuleValidationException("Empty"));

            var result = await _controller.Filter(null, null, null);

            var nf = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Empty", nf.Value);
        }
        
        [Fact]
        public async Task Update_ShouldReturnOk_WhenValid()
        {
            var id = Guid.NewGuid();
            var dto = new UpdateVesselTypeDto
            {
                Name = "Updated Vessel",
                Description = "Updated description with more than ten chars",
                MaxBays = 15
            };

            var updated = new VesselTypeDto(id, "Updated Vessel", dto.Description!, 15, 8, 6, 720);
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<VesselTypeId>(), dto)).ReturnsAsync(updated);

            var result = await _controller.Update(id, dto);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<VesselTypeDto>(ok.Value);
            Assert.Equal("Updated Vessel", value.Name);
            Assert.Equal(15, value.MaxBays);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenInvalid()
        {
            var id = Guid.NewGuid();
            var dto = new UpdateVesselTypeDto { Name = "" };
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<VesselTypeId>(), dto))
                .ThrowsAsync(new BusinessRuleValidationException("Invalid update"));

            var result = await _controller.Update(id, dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Invalid update", bad.Value);
        }

    }
}
