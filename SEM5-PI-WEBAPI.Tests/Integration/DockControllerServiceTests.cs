using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Dock;
using SEM5_PI_WEBAPI.Domain.Dock.DTOs;
using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Tests.Integration;

public class DockServiceControllerTests
{
    private readonly Mock<IDockRepository> _dockRepo = new();
    private readonly Mock<IVesselTypeRepository> _vtRepo = new();
    private readonly Mock<IPhysicalResourceRepository> _prRepo = new();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<ILogger<DockService>> _svcLogger = new();
    private readonly Mock<ILogger<DockController>> _ctlLogger = new();

    private readonly DockService _service;
    private readonly DockController _controller;

    public DockServiceControllerTests()
    {
        _service = new DockService(
            _uow.Object,
            _dockRepo.Object,
            _vtRepo.Object,
            _prRepo.Object,
            _svcLogger.Object
        );
        _controller = new DockController(_service, _ctlLogger.Object);
    }

    private static DockDto MakeDto(string code = "DK-0001")
    {
        return new DockDto(
            Guid.NewGuid(),
            new DockCode(code),
            new List<PhysicalResourceCode> { new PhysicalResourceCode("RES-0001") },
            "Terminal Norte",
            300, 14, 13,
            DockStatus.Available,
            new List<VesselTypeId> { new VesselTypeId(Guid.NewGuid()) }
        );
    }

    [Fact]
    public async Task GetAll_ShouldReturnOk_WhenDocksExist()
    {
        _dockRepo.Setup(r => r.GetAllAsync())
                 .ReturnsAsync(new List<EntityDock>
                 {
                     new EntityDock(new DockCode("DK-0001"),
                                    new []{ new PhysicalResourceCode("RES-0001") },
                                    "Terminal A", 300, 14, 13,
                                    new []{ new VesselTypeId(Guid.NewGuid()) },
                                    DockStatus.Available),
                     new EntityDock(new DockCode("DK-0002"),
                                    new []{ new PhysicalResourceCode("RES-0002") },
                                    "Terminal B", 320, 15, 14,
                                    new []{ new VesselTypeId(Guid.NewGuid()) },
                                    DockStatus.Available),
                 });

        var result = await _controller.GetAllAsync();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetById_ShouldReturnOk_WhenFound()
    {
        var e = new EntityDock(new DockCode("DK-0100"),
                               new []{ new PhysicalResourceCode("RES-0100") },
                               "T1", 300, 14, 13,
                               new []{ new VesselTypeId(Guid.NewGuid()) },
                               DockStatus.Available);
        _dockRepo.Setup(r => r.GetByIdAsync(It.IsAny<DockId>()))
                 .ReturnsAsync(e);

        var result = await _controller.GetById(Guid.NewGuid());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0100", dto.Code.Value);
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenMissing()
    {
        _dockRepo.Setup(r => r.GetByIdAsync(It.IsAny<DockId>()))
                 .ReturnsAsync((EntityDock?)null);

        var result = await _controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ShouldReturnCreated_WhenValid()
    {
        var vtName = "Panamax";
        var payload = new RegisterDockDto(
            "DK-0200",
            Array.Empty<string>(),
            "Terminal",
            300, 14, 13,
            new[] { vtName },
            DockStatus.Available
        );

        _dockRepo.Setup(r => r.GetByCodeAsync(It.IsAny<DockCode>()))
                 .ReturnsAsync((EntityDock?)null);

        _vtRepo.Setup(r => r.GetByNameAsync(vtName))
               .ReturnsAsync(new VesselType(vtName, 10, 10, 10, "valid description"));

        _dockRepo.Setup(r => r.AddAsync(It.IsAny<EntityDock>()))
                 .ReturnsAsync((EntityDock e) => e);

        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(1);

        var result = await _controller.CreateAsync(payload);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<DockDto>(created.Value);
        Assert.Equal("DK-0200", dto.Code.Value);
        Assert.Equal(nameof(DockController.GetById), created.ActionName);
    }

    [Fact]
    public async Task Create_ShouldReturnBadRequest_WhenVesselTypeDoesNotExist()
    {
        var payload = new RegisterDockDto(
            "DK-0300",
            Array.Empty<string>(),
            "Terminal",
            300, 14, 13,
            new[] { "DoesNotExist" },
            DockStatus.Available
        );

        _dockRepo.Setup(r => r.GetByCodeAsync(It.IsAny<DockCode>()))
                 .ReturnsAsync((EntityDock?)null);

        _vtRepo.Setup(r => r.GetByNameAsync("DoesNotExist"))
               .ReturnsAsync((VesselType?)null);

        var result = await _controller.CreateAsync(payload);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByCode_ShouldReturnOk_WhenFound()
    {
        var e = new EntityDock(new DockCode("DK-0400"),
                               new []{ new PhysicalResourceCode("RES-0400") },
                               "T4", 300, 14, 13,
                               new []{ new VesselTypeId(Guid.NewGuid()) },
                               DockStatus.Available);
        _dockRepo.Setup(r => r.GetByCodeAsync(It.Is<DockCode>(c => c.Value=="DK-0400")))
                 .ReturnsAsync(e);

        var result = await _controller.GetByCodeAsync("DK-0400");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0400", dto.Code.Value);
    }

    [Fact]
    public async Task GetByCode_ShouldReturnNotFound_WhenMissing()
    {
        _dockRepo.Setup(r => r.GetByCodeAsync(It.IsAny<DockCode>()))
                 .ReturnsAsync((EntityDock?)null);

        var result = await _controller.GetByCodeAsync("DK-9999");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByVesselType_ShouldReturnOkList()
    {
        var vt = new VesselTypeId(Guid.NewGuid());
        _dockRepo.Setup(r => r.GetByVesselTypeAsync(vt))
                 .ReturnsAsync(new List<EntityDock>
                 {
                     new EntityDock(new DockCode("DK-0500"),
                                    new []{ new PhysicalResourceCode("RES-0500") },
                                    "T5", 300, 14, 13,
                                    new []{ vt },
                                    DockStatus.Available)
                 });

        var result = await _controller.GetByVesselTypeAsync(vt.Value.ToString());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
        Assert.Equal("DK-0500", list[0].Code.Value);
    }

    [Fact]
    public async Task GetByFilter_ShouldReturnOkList()
    {
        _dockRepo.Setup(r => r.GetFilterAsync(
                It.IsAny<DockCode?>(),
                It.IsAny<VesselTypeId?>(),
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.IsAny<DockStatus?>()))
            .ReturnsAsync(new List<EntityDock>
            {
                new EntityDock(new DockCode("DK-0600"),
                               new []{ new PhysicalResourceCode("RES-0600") },
                               "T6", 300, 14, 13,
                               new []{ new VesselTypeId(Guid.NewGuid()) },
                               DockStatus.Maintenance)
            });

        var result = await _controller.GetByFilterAsync("DK-0600", null, null, "DK", "Maintenance");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
        Assert.Equal("DK-0600", list[0].Code.Value);
    }

    [Fact]
    public async Task GetByLocation_ShouldReturnOk()
    {
        _dockRepo.Setup(r => r.GetByLocationAsync("Norte"))
                 .ReturnsAsync(new List<EntityDock>
                 {
                     new EntityDock(new DockCode("DK-0700"),
                                    new []{ new PhysicalResourceCode("RES-0700") },
                                    "Norte", 300, 14, 13,
                                    new []{ new VesselTypeId(Guid.NewGuid()) },
                                    DockStatus.Available)
                 });

        var result = await _controller.GetByLocationAsync("Norte");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
        Assert.Equal("Norte", list[0].Location);
    }

    [Fact]
    public async Task GetByPhysicalResourceCode_ShouldReturnOk()
    {
        var e = new EntityDock(new DockCode("DK-0800"),
                               new []{ new PhysicalResourceCode("RES-0800") },
                               "T8", 300, 14, 13,
                               new []{ new VesselTypeId(Guid.NewGuid()) },
                               DockStatus.Available);
        _dockRepo.Setup(r => r.GetByPhysicalResourceCodeAsync(It.Is<PhysicalResourceCode>(p => p.Value=="RES-0800")))
                 .ReturnsAsync(e);

        var result = await _controller.GetByPhysicalResourceCode("RES-0800");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0800", dto.Code.Value);
    }

    [Fact]
    public async Task PatchByCode_ShouldReturnOk()
    {
        var current = new EntityDock(new DockCode("DK-0900"),
                                     new []{ new PhysicalResourceCode("RES-0900") },
                                     "T9", 300, 14, 13,
                                     new []{ new VesselTypeId(Guid.NewGuid()) },
                                     DockStatus.Available);

        _dockRepo.Setup(r => r.GetByCodeAsync(It.Is<DockCode>(c => c.Value=="DK-0900")))
                 .ReturnsAsync(current);
        _dockRepo.Setup(r => r.GetByCodeAsync(It.Is<DockCode>(c => c.Value=="DK-0901")))
                 .ReturnsAsync((EntityDock?)null);
        _uow.Setup(u => u.CommitAsync()).ReturnsAsync(1);

        var result = await _controller.PatchByCodeAsync("DK-0900", new UpdateDockDto { Code = "DK-0901", Location="L1" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0901", dto.Code.Value);
        Assert.Equal("L1", dto.Location);
    }

    [Fact]
    public async Task PatchByCode_ShouldReturnBadRequest_OnBusinessRule()
    {
        _dockRepo.Setup(r => r.GetByCodeAsync(It.IsAny<DockCode>()))
                 .ReturnsAsync((EntityDock?)null);

        var result = await _controller.PatchByCodeAsync("DK-9999", new UpdateDockDto { Location = "X" });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAllCodes_ShouldReturnOk()
    {
        _dockRepo.Setup(r => r.GetAllDockCodesAsync())
                 .ReturnsAsync(new List<DockCode> { new DockCode("DK-1000"), new DockCode("DK-1001") });

        var result = await _controller.GetAllCodes();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<string>>(ok.Value);
        Assert.Equal(new[] { "DK-1000", "DK-1001" }, list);
    }
}
