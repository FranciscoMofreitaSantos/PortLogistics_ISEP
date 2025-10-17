using Microsoft.AspNetCore.Mvc;
using Moq;
using Newtonsoft.Json.Linq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.Integration
{
    public class PhysicalResourceControllerServiceTests
    {
        private readonly Mock<IPhysicalResourceService> _serviceMock = new();
        private readonly PhysicalResourceController _controller;

        public PhysicalResourceControllerServiceTests()
        {
            _controller = new PhysicalResourceController(_serviceMock.Object);
        }

        private PhysicalResourceDTO CreateDto()
        {
            return new PhysicalResourceDTO(
                Guid.NewGuid(),
                new PhysicalResourceCode("TRUCK-0001"),
                "Truck A",
                25.0,
                10.0,
                PhysicalResourceType.Truck,
                PhysicalResourceStatus.Available,
                Guid.NewGuid()
            );
        }

        // --- GET ALL ---
        [Fact]
        public async Task GetAll_ShouldReturnOk_WhenResourcesExist()
        {
            var dtoList = new List<PhysicalResourceDTO> { CreateDto() };
            _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(dtoList);

            var result = await _controller.GetAll();

            Assert.NotNull(result.Value);
            Assert.Single(result.Value);
        }

        // --- GET BY ID ---
        [Fact]
        public async Task GetById_ShouldReturnOk_WhenExists()
        {
            var dto = CreateDto();
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(dto);

            var result = await _controller.GetByID(Guid.NewGuid());

            Assert.NotNull(result.Value);
            Assert.Equal(dto.Id, result.Value.Id);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenMissing()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync((PhysicalResourceDTO)null!);

            var result = await _controller.GetByID(Guid.NewGuid());

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("not found", notFound.Value!.ToString());
        }

        // --- GET BY CODE ---
        [Fact]
        public async Task GetByCode_ShouldReturnOk_WhenExists()
        {
            var dto = CreateDto();
            _serviceMock.Setup(s => s.GetByCodeAsync(It.IsAny<PhysicalResourceCode>()))
                .ReturnsAsync(dto);

            var result = await _controller.GetByCode("TRUCK-0001");

            Assert.NotNull(result.Value);
            Assert.Equal("Truck A", result.Value.Description);
        }

        // --- GET BY DESCRIPTION ---
        [Fact]
        public async Task GetByDescription_ShouldReturnOk_WhenFound()
        {
            var list = new List<PhysicalResourceDTO> { CreateDto() };
            _serviceMock.Setup(s => s.GetByDescriptionAsync("Truck")).ReturnsAsync(list);

            var result = await _controller.GetByDescription("Truck");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<List<PhysicalResourceDTO>>(ok.Value);
            Assert.Single(data);
        }

        [Fact]
        public async Task GetByDescription_ShouldReturnNotFound_WhenEmpty()
        {
            _serviceMock.Setup(s => s.GetByDescriptionAsync("Invalid"))
                .ReturnsAsync(new List<PhysicalResourceDTO>());

            var result = await _controller.GetByDescription("Invalid");

            var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("not found", notFound.Value!.ToString());
        }

        // --- GET BY STATUS ---
        [Fact]
        public async Task GetByStatus_ShouldReturnOk_WhenFound()
        {
            var list = new List<PhysicalResourceDTO> { CreateDto() };
            _serviceMock.Setup(s => s.GetByStatusAsync(PhysicalResourceStatus.Available))
                .ReturnsAsync(list);

            var result = await _controller.GetByStatus(PhysicalResourceStatus.Available);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<List<PhysicalResourceDTO>>(ok.Value);
        }

        // --- GET BY TYPE ---
        [Fact]
        public async Task GetByType_ShouldReturnOk_WhenFound()
        {
            var list = new List<PhysicalResourceDTO> { CreateDto() };
            _serviceMock.Setup(s => s.GetByTypeAsync(PhysicalResourceType.Truck))
                .ReturnsAsync(list);

            var result = await _controller.GetByType(PhysicalResourceType.Truck);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<List<PhysicalResourceDTO>>(ok.Value);
            Assert.Single(data);
        }

        // --- GET BY QUALIFICATION ---
        [Fact]
        public async Task GetByQualification_ShouldReturnOk_WhenFound()
        {
            var list = new List<PhysicalResourceDTO> { CreateDto() };
            _serviceMock.Setup(s => s.GetByQualificationAsync(It.IsAny<QualificationId>()))
                .ReturnsAsync(list);

            var result = await _controller.GetByQualification(Guid.NewGuid());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var data = Assert.IsType<List<PhysicalResourceDTO>>(ok.Value);
            Assert.Single(data);
        }

        // --- POST CREATE ---
        [Fact]
        public async Task Create_ShouldReturnCreated_WhenValid()
        {
            var dto = new CreatingPhysicalResourceDTO(
                "Truck A", 25.0, 10.0, PhysicalResourceType.Truck, Guid.NewGuid());
            var created = CreateDto();

            _serviceMock.Setup(s => s.AddAsync(dto)).ReturnsAsync(created);

            var result = await _controller.Create(dto);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.IsType<PhysicalResourceDTO>(createdResult.Value);
        }

        [Fact]
        public async Task Create_ShouldReturnBadRequest_WhenBusinessRuleFails()
        {
            var dto = new CreatingPhysicalResourceDTO(
                "Truck A", 25.0, 10.0, PhysicalResourceType.Truck, Guid.NewGuid());

            _serviceMock.Setup(s => s.AddAsync(dto))
                .ThrowsAsync(new BusinessRuleValidationException("Qualification not found."));

            var result = await _controller.Create(dto);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Qualification not found", bad.Value!.ToString());
        }

        // --- PATCH UPDATE ---
        [Fact]
        public async Task Update_ShouldReturnOk_WhenValidFields()
        {
            var updated = CreateDto();
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<PhysicalResourceId>(), It.IsAny<UpdatingPhysicalResource>()))
                .ReturnsAsync(updated);

            var body = new JObject { ["description"] = "Updated Description" };

            var result = await _controller.Update(Guid.NewGuid(), body);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PhysicalResourceDTO>(ok.Value);
        }

        [Fact]
        public async Task Update_ShouldReturnBadRequest_WhenInvalidFieldsProvided()
        {
            var body = new JObject { ["invalid"] = "x" };

            var result = await _controller.Update(Guid.NewGuid(), body);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("cannot be updated", bad.Value!.ToString());
        }

        // --- DEACTIVATE ---
        [Fact]
        public async Task Deactivate_ShouldReturnOk_WhenSuccess()
        {
            var dto = CreateDto();
            _serviceMock.Setup(s => s.DeactivationAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(dto);

            var result = await _controller.Deactivate(Guid.NewGuid());

            Assert.NotNull(result.Value);
            Assert.Equal(dto.Id, result.Value.Id);
        }

        [Fact]
        public async Task Deactivate_ShouldReturnBadRequest_WhenExceptionThrown()
        {
            _serviceMock.Setup(s => s.DeactivationAsync(It.IsAny<PhysicalResourceId>()))
                .ThrowsAsync(new Exception("Already inactive."));

            var result = await _controller.Deactivate(Guid.NewGuid());

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Already inactive", bad.Value!.ToString());
        }

        // --- REACTIVATE ---
        [Fact]
        public async Task Reactivate_ShouldReturnOk_WhenSuccess()
        {
            var dto = CreateDto();
            _serviceMock.Setup(s => s.ReactivationAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(dto);

            var result = await _controller.Activate(Guid.NewGuid());

            Assert.NotNull(result.Value);
            Assert.Equal(dto.Id, result.Value.Id);
        }

        [Fact]
        public async Task Reactivate_ShouldReturnBadRequest_WhenExceptionThrown()
        {
            _serviceMock.Setup(s => s.ReactivationAsync(It.IsAny<PhysicalResourceId>()))
                .ThrowsAsync(new Exception("Already active."));

            var result = await _controller.Activate(Guid.NewGuid());

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Contains("Already active", bad.Value!.ToString());
        }
    }
}
