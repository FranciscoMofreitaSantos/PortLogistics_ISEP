using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Dock;
using SEM5_PI_WEBAPI.Domain.Dock.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Tests.Controllers;

public class DockControllerTests
{
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


    private static DockController MakeController(Mock<IDockService> svcMock)
    {
        var log = new Mock<ILogger<DockController>>();
        return new DockController(svcMock.Object, log.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsOk_WithList()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetAllAsync())
           .ReturnsAsync(new List<DockDto> { MakeDto("DK-0001"), MakeDto("DK-0002") });

        var controller = MakeController(svc);

        var result = await controller.GetAllAsync();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Equal(2, list.Count);
    }

    [Fact]
    public async Task GetById_Found_ReturnsOk()
    {
        var dto = MakeDto("DK-0100");
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByIdAsync(It.IsAny<DockId>())).ReturnsAsync(dto);

        var controller = MakeController(svc);

        var result = await controller.GetById(Guid.NewGuid());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0100", body.Code.Value);
    }

    [Fact]
    public async Task GetById_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByIdAsync(It.IsAny<DockId>()))
           .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);

        var result = await controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateAsync_Valid_ReturnsCreated()
    {
        var svc = new Mock<IDockService>();
        var created = MakeDto("DK-0200");
        svc.Setup(s => s.CreateAsync(It.IsAny<RegisterDockDto>()))
           .ReturnsAsync(created);

        var controller = MakeController(svc);

        var payload = new RegisterDockDto(
            "DK-0200",
            new[] { "RES-0001" },
            "Terminal",
            300, 14, 13,
            new[] { "Panamax" },
            DockStatus.Available
        );

        var result = await controller.CreateAsync(payload);

        var createdRes = Assert.IsType<CreatedAtActionResult>(result.Result);
        var body = Assert.IsType<DockDto>(createdRes.Value);
        Assert.Equal("DK-0200", body.Code.Value);
        Assert.Equal(nameof(DockController.GetById), createdRes.ActionName);
    }

    [Fact]
    public async Task CreateAsync_BadRequest_OnBusinessError()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.CreateAsync(It.IsAny<RegisterDockDto>()))
           .ThrowsAsync(new BusinessRuleValidationException("bad"));

        var controller = MakeController(svc);

        var payload = new RegisterDockDto(
            "DK-0001",
            new[] { "RES-0001" },
            "Terminal",
            300, 14, 13,
            new[] { "Panamax" },
            DockStatus.Available
        );

        var result = await controller.CreateAsync(payload);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByCode_Found_ReturnsOk()
    {
        var dto = MakeDto("DK-0300");
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByCodeAsync("DK-0300")).ReturnsAsync(dto);

        var controller = MakeController(svc);

        var result = await controller.GetByCodeAsync("DK-0300");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0300", body.Code.Value);
    }

    [Fact]
    public async Task GetByCode_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByCodeAsync(It.IsAny<string>()))
           .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);

        var result = await controller.GetByCodeAsync("DK-9999");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByVesselType_ReturnsOkList()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByVesselTypeAsync(It.IsAny<string>()))
           .ReturnsAsync(new List<DockDto> { MakeDto("DK-0400") });

        var controller = MakeController(svc);

        var result = await controller.GetByVesselTypeAsync(Guid.NewGuid().ToString());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
    }

    [Fact]
    public async Task GetByFilter_ReturnsOkList()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetFilterAsync("DK-0500", null, null, "DK", "Available"))
           .ReturnsAsync(new List<DockDto> { MakeDto("DK-0500") });

        var controller = MakeController(svc);

        var result = await controller.GetByFilterAsync("DK-0500", null, null, "DK", "Available");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
    }

    [Fact]
    public async Task GetByLocation_ReturnsOk()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByLocationAsync("Norte"))
           .ReturnsAsync(new List<DockDto> { MakeDto("DK-0600") });

        var controller = MakeController(svc);

        var result = await controller.GetByLocationAsync("Norte");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<DockDto>>(ok.Value);
        Assert.Single(list);
    }

    [Fact]
    public async Task GetByPhysicalResourceCode_ReturnsOk()
    {
        var dto = MakeDto("DK-0700");
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByPhysicalResourceCodeAsync("RES-0001")).ReturnsAsync(dto);

        var controller = MakeController(svc);

        var result = await controller.GetByPhysicalResourceCode("RES-0001");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0700", body.Code.Value);
    }

    [Fact]
    public async Task PatchByCode_Ok()
    {
        var updated = MakeDto("DK-0800");
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.PatchByCodeAsync("DK-0800", It.IsAny<UpdateDockDto>()))
           .ReturnsAsync(updated);

        var controller = MakeController(svc);

        var result = await controller.PatchByCodeAsync("DK-0800", new UpdateDockDto { Location = "X" });

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<DockDto>(ok.Value);
        Assert.Equal("DK-0800", body.Code.Value);
    }

    [Fact]
    public async Task PatchByCode_BadRequest_WhenNullDto()
    {
        var svc = new Mock<IDockService>();
        var controller = MakeController(svc);

        var result = await controller.PatchByCodeAsync("DK-0800", null);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetAllCodes_ReturnsOk()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetAllDockCodesAsync())
           .ReturnsAsync(new List<string> { "DK-1000", "DK-1001" });

        var controller = MakeController(svc);

        var result = await controller.GetAllCodes();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<List<string>>(ok.Value);
        Assert.Equal(new[] { "DK-1000", "DK-1001" }, list);
    }
    
    [Fact]
    public async Task GetByVesselType_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByVesselTypeAsync(It.IsAny<string>()))
            .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);
        var result = await controller.GetByVesselTypeAsync(Guid.NewGuid().ToString());

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByFilter_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetFilterAsync("DK-0500", null, null, "DK", "Available"))
            .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);
        var result = await controller.GetByFilterAsync("DK-0500", null, null, "DK", "Available");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByLocation_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByLocationAsync("Norte"))
            .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);
        var result = await controller.GetByLocationAsync("Norte");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByPhysicalResourceCode_NotFound_Returns404()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.GetByPhysicalResourceCodeAsync("RES-0001"))
            .ThrowsAsync(new BusinessRuleValidationException("missing"));

        var controller = MakeController(svc);
        var result = await controller.GetByPhysicalResourceCode("RES-0001");

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task PatchByCode_BadRequest_OnBusinessError()
    {
        var svc = new Mock<IDockService>();
        svc.Setup(s => s.PatchByCodeAsync("DK-0800", It.IsAny<UpdateDockDto>()))
            .ThrowsAsync(new BusinessRuleValidationException("bad"));

        var controller = MakeController(svc);
        var result = await controller.PatchByCodeAsync("DK-0800", new UpdateDockDto { Location = "X" });

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
