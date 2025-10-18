/*
using Moq;
using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.Services
{
    public class PhysicalResourceServiceTests
    {
        private readonly Mock<IUnitOfWork> _uowMock = new();
        private readonly Mock<IPhysicalResourceRepository> _repoMock = new();
        private readonly Mock<IQualificationRepository> _qualRepoMock = new();

        private readonly PhysicalResourceService _service;

        public PhysicalResourceServiceTests()
        {
            _service = new PhysicalResourceService(_uowMock.Object, _repoMock.Object, _qualRepoMock.Object);
        }

        private EntityPhysicalResource CreateResource()
        {
            return new EntityPhysicalResource(
                new PhysicalResourceCode("TRUCK-0001"),
                "Truck A",
                25.0,
                10.0,
                PhysicalResourceType.Truck,
                new QualificationId(Guid.NewGuid())
            );
        }

        // --- CREATE ---
        [Fact]
        public async Task AddAsync_ShouldCreatePhysicalResource_WhenValid()
        {
            var dto = new CreatingPhysicalResourceDto(
                "Truck A",
                25.0,
                10.0,
                PhysicalResourceType.Truck,
                "QUL-001");

            var qualification = new Qualification("Driver License");
            qualification.UpdateCode("QUL-001");

            _qualRepoMock.Setup(r => r.GetQualificationByCodeAsync("QUL-001"))
                .ReturnsAsync(qualification);

            _repoMock.Setup(r => r.CountByTypeAsync(It.IsAny<PhysicalResourceType>()))
                .ReturnsAsync(0);

            _repoMock.Setup(r => r.AddAsync(It.IsAny<EntityPhysicalResource>()))
                .ReturnsAsync((EntityPhysicalResource e) => e);

            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _service.AddAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(dto.Description, result.Description);
            _repoMock.Verify(r => r.AddAsync(It.IsAny<EntityPhysicalResource>()), Times.Once);
            _uowMock.Verify(u => u.CommitAsync(), Times.Once);
        }

        [Fact]
        public async Task AddAsync_ShouldThrow_WhenQualificationCodeNotFound()
        {
            var dto = new CreatingPhysicalResourceDto(
                "Truck A",
                25.0,
                10.0,
                PhysicalResourceType.Truck,
                "INVALID");

            _qualRepoMock.Setup(r => r.GetQualificationByCodeAsync("INVALID"))
                .ReturnsAsync((Qualification?)null);

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() => _service.AddAsync(dto));
        }

        // --- GET BY ID ---
        [Fact]
        public async Task GetByIdAsync_ShouldReturnResource_WhenExists()
        {
            var entity = CreateResource();

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);

            var result = await _service.GetByIdAsync(new PhysicalResourceId(Guid.NewGuid()));

            Assert.NotNull(result);
            Assert.Equal(entity.Description, result.Description);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrow_WhenNotFound()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync((EntityPhysicalResource?)null);

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() =>
                _service.GetByIdAsync(new PhysicalResourceId(Guid.NewGuid())));
        }

        // --- GET BY CODE ---
        [Fact]
        public async Task GetByCodeAsync_ShouldReturnResource_WhenExists()
        {
            var entity = CreateResource();
            _repoMock.Setup(r => r.GetByCodeAsync(It.IsAny<PhysicalResourceCode>()))
                .ReturnsAsync(entity);

            var result = await _service.GetByCodeAsync(new PhysicalResourceCode("TRUCK-0001"));

            Assert.NotNull(result);
            Assert.Equal(entity.Code.Value, result.Code.Value);
        }

        [Fact]
        public async Task GetByCodeAsync_ShouldThrow_WhenNotFound()
        {
            _repoMock.Setup(r => r.GetByCodeAsync(It.IsAny<PhysicalResourceCode>()))
                .ReturnsAsync((EntityPhysicalResource?)null);

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() =>
                _service.GetByCodeAsync(new PhysicalResourceCode("ABC-9999")));
        }

        // --- UPDATE ---
        [Fact]
        public async Task UpdateAsync_ShouldModifyFields_WhenValid()
        {
            var entity = CreateResource();

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);
            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var dto = new UpdatingPhysicalResource("Updated Truck", 30, 5, null);

            var result = await _service.UpdateAsync(new PhysicalResourceId(Guid.NewGuid()), dto);

            Assert.Equal("Updated Truck", result.Description);
            _uowMock.Verify(u => u.CommitAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnNull_WhenNotFound()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync((EntityPhysicalResource?)null);

            var dto = new UpdatingPhysicalResource("Updated", 10, 5, null);
            var result = await _service.UpdateAsync(new PhysicalResourceId(Guid.NewGuid()), dto);

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrow_WhenQualificationNotFound()
        {
            var entity = CreateResource();
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>())).ReturnsAsync(entity);
            _qualRepoMock.Setup(r => r.ExistQualificationID(It.IsAny<QualificationId>())).ReturnsAsync(false);

            var dto = new UpdatingPhysicalResource("Truck A", 20, 5, Guid.NewGuid());

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() =>
                _service.UpdateAsync(new PhysicalResourceId(Guid.NewGuid()), dto));
        }

        // --- DEACTIVATE ---
        [Fact]
        public async Task DeactivationAsync_ShouldSetStatusUnavailable_WhenActive()
        {
            var entity = CreateResource();
            entity.UpdateStatus(PhysicalResourceStatus.Available);

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);
            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _service.DeactivationAsync(new PhysicalResourceId(Guid.NewGuid()));

            Assert.Equal(PhysicalResourceStatus.Unavailable, result.PhysicalResourceStatus);
            _uowMock.Verify(u => u.CommitAsync(), Times.Once);
        }

        [Fact]
        public async Task DeactivationAsync_ShouldThrow_WhenAlreadyInactive()
        {
            var entity = CreateResource();
            entity.UpdateStatus(PhysicalResourceStatus.Unavailable);

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() =>
                _service.DeactivationAsync(new PhysicalResourceId(Guid.NewGuid())));
        }

        // --- REACTIVATE ---
        [Fact]
        public async Task ReactivationAsync_ShouldSetStatusAvailable_WhenInactive()
        {
            var entity = CreateResource();
            entity.UpdateStatus(PhysicalResourceStatus.Unavailable);

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);
            _uowMock.Setup(u => u.CommitAsync()).ReturnsAsync(1);

            var result = await _service.ReactivationAsync(new PhysicalResourceId(Guid.NewGuid()));

            Assert.Equal(PhysicalResourceStatus.Available, result.PhysicalResourceStatus);
        }

        [Fact]
        public async Task ReactivationAsync_ShouldThrow_WhenAlreadyActive()
        {
            var entity = CreateResource();
            entity.UpdateStatus(PhysicalResourceStatus.Available);

            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<PhysicalResourceId>()))
                .ReturnsAsync(entity);

            await Assert.ThrowsAsync<BusinessRuleValidationException>(() =>
                _service.ReactivationAsync(new PhysicalResourceId(Guid.NewGuid())));
        }
    }
}
*/
