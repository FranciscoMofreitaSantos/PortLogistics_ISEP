using SEM5_PI_WEBAPI.Domain.BusinessShared;

namespace SEM5_PI_WEBAPI.Tests.Controllers;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SEM5_PI_WEBAPI.Controllers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;
using Xunit;

public class StaffMembersControllerTests
{
    private readonly Mock<IStaffMemberService> _serviceMock;
    private readonly StaffMembersController _controller;

    public StaffMembersControllerTests()
    {
        _serviceMock = new Mock<IStaffMemberService>();
        _controller = new StaffMembersController(_serviceMock.Object);
    }

    private StaffMemberDto BuildDto()
    {
        return new StaffMemberDto(Guid.NewGuid(), "TestName", "1234567", "test@example.com", "+1234567890",
            new ScheduleDto(ShiftType.Morning, "1010101"), true, new List<string> { "QLF-001" });
    }

    [Fact]
    public async Task GetAll_ShouldReturnList()
    {
        var list = new List<StaffMemberDto> { BuildDto(), BuildDto() };
        _serviceMock.Setup(s => s.GetAllAsync()).ReturnsAsync(list);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<List<StaffMemberDto>>(result.Value);
        Assert.Equal(2, ok.Count);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenNull()
    {
        _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StaffMemberId>())).ReturnsAsync((StaffMemberDto?)null);

        var result = await _controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetById_ReturnsStaffMember_WhenFound()
    {
        var dto = BuildDto();
        _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StaffMemberId>())).ReturnsAsync(dto);

        var result = await _controller.GetById(Guid.NewGuid());

        var ok = Assert.IsType<StaffMemberDto>(result.Value);
        Assert.Equal(dto.Id, ok.Id);
    }

    [Fact]
    public async Task GetById_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<StaffMemberId>())).ThrowsAsync(new BusinessRuleValidationException("Error"));

        var result = await _controller.GetById(Guid.NewGuid());

        var badReq = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Error", badReq.Value.ToString());
    }

    [Fact]
    public async Task GetByQualifications_ReturnsBadRequest_WhenNoCodes()
    {
        var codesDto = new CodesListDto(new List<string>() ) { QualificationsCodes = new List<string>() };

        var result = await _controller.GetByQualifications(codesDto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("At least one qualification code must be provided.", bad.Value);
    }

    [Fact]
    public async Task GetByQualifications_ReturnsOk_WhenValid()
    {
        var codes = new List<string> { "QLF-001" };
        var codesDto = new CodesListDto(new List<string>() ) { QualificationsCodes = codes };
        var list = new List<StaffMemberDto> { BuildDto() };

        _serviceMock.Setup(s => s.GetByQualificationsAsync(codes)).ReturnsAsync(list);

        var result = await _controller.GetByQualifications(codesDto);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<List<StaffMemberDto>>(ok.Value);
        Assert.Single(val);
    }

    [Fact]
    public async Task GetByQualifications_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        var codes = new List<string> { "QLF-001" };
        var codesDto = new CodesListDto(new List<string>() ) { QualificationsCodes = codes };

        _serviceMock.Setup(s => s.GetByQualificationsAsync(codes)).ThrowsAsync(new BusinessRuleValidationException("Invalid"));

        var result = await _controller.GetByQualifications(codesDto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Invalid", bad.Value.ToString());
    }

    [Fact]
    public async Task GetByExactQualifications_ReturnsBadRequest_WhenNoCodes()
    {
        var codesDto = new CodesListDto(new List<string>() ) { QualificationsCodes = new List<string>() };

        var result = await _controller.GetByAllQualifications(codesDto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("At least one qualification code must be provided.", bad.Value);
    }

    [Fact]
    public async Task GetByExactQualifications_ReturnsOk_WhenValid()
    {
        var codes = new List<string> { "QLF-001" };
        var codesDto = new CodesListDto(new List<string>() ) { QualificationsCodes = codes };
        var list = new List<StaffMemberDto> { BuildDto() };

        _serviceMock.Setup(s => s.GetByExactQualificationsAsync(codes)).ReturnsAsync(list);

        var result = await _controller.GetByAllQualifications(codesDto);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<List<StaffMemberDto>>(ok.Value);
        Assert.Single(val);
    }

    [Fact]
    public async Task GetByExactQualifications_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        var codes = new List<string> { "QLF-001" };
        var codesDto = new CodesListDto(new List<string>()) { QualificationsCodes = codes };

        _serviceMock.Setup(s => s.GetByExactQualificationsAsync(codes)).ThrowsAsync(new BusinessRuleValidationException("Invalid"));

        var result = await _controller.GetByAllQualifications(codesDto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Invalid", bad.Value.ToString());
    }

    [Fact]
    public async Task GetByMecanographicNumber_ReturnsNotFound_WhenNull()
    {
        _serviceMock.Setup(s => s.GetByMecNumberAsync(It.IsAny<string>())).ReturnsAsync((StaffMemberDto?)null);

        var result = await _controller.GetByMecanographicNumber("12345");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetByMecanographicNumber_ReturnsOk_WhenFound()
    {
        var dto = BuildDto();
        _serviceMock.Setup(s => s.GetByMecNumberAsync(It.IsAny<string>())).ReturnsAsync(dto);

        var result = await _controller.GetByMecanographicNumber("12345");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<StaffMemberDto>(ok.Value);
        Assert.Equal(dto.Id, val.Id);
    }

    [Fact]
    public async Task GetByName_ReturnsNotFound_WhenNullOrEmpty()
    {
        _serviceMock.Setup(s => s.GetByNameAsync("name")).ReturnsAsync(new List<StaffMemberDto>());

        var result = await _controller.GetByName("name");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetByName_ReturnsOk_WhenFound()
    {
        var list = new List<StaffMemberDto> { BuildDto() };
        _serviceMock.Setup(s => s.GetByNameAsync("name")).ReturnsAsync(list);

        var result = await _controller.GetByName("name");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<List<StaffMemberDto>>(ok.Value);
        Assert.Single(val);
    }

    [Fact]
    public async Task GetByName_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        _serviceMock.Setup(s => s.GetByNameAsync("name")).ThrowsAsync(new BusinessRuleValidationException("Error"));

        var result = await _controller.GetByName("name");

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Error", bad.Value.ToString());
    }

    [Fact]
    public async Task GetByStatus_ReturnsOk()
    {
        var list = new List<StaffMemberDto> { BuildDto() };
        _serviceMock.Setup(s => s.GetByStatusAsync(true)).ReturnsAsync(list);

        var result = await _controller.GetByStatus(true);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<List<StaffMemberDto>>(ok.Value);
        Assert.Single(val);
    }

    [Fact]
    public async Task GetByStatus_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        _serviceMock.Setup(s => s.GetByStatusAsync(It.IsAny<bool>())).ThrowsAsync(new BusinessRuleValidationException("Error"));

        var result = await _controller.GetByStatus(true);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Error", bad.Value.ToString());
    }

    [Fact]
    public async Task Create_ReturnsCreated()
    {
        var dto = new CreatingStaffMemberDto("Test", "test@example.com", "+351912856565",new ScheduleDto(ShiftType.Morning, "1010101"), true, new List<string>());
        var staffDto = BuildDto();

        _serviceMock.Setup(s => s.AddAsync(dto)).ReturnsAsync(staffDto);

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var val = Assert.IsType<StaffMemberDto>(created.Value);
        Assert.Equal(staffDto.Id, val.Id);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        var dto = new CreatingStaffMemberDto("Test", "test@example.com", "+351912856565",new ScheduleDto(ShiftType.Morning, "1010101"), true, new List<string>());

        _serviceMock.Setup(s => s.AddAsync(dto)).ThrowsAsync(new BusinessRuleValidationException("Invalid"));

        var result = await _controller.Create(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Invalid", bad.Value.ToString());
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenStaffUpdated()
    {
        var dto = new UpdateStaffMemberDto { MecNumber = "1234567" };
        var staffDto = BuildDto();

        _serviceMock.Setup(s => s.UpdateAsync(dto)).ReturnsAsync(staffDto);

        var result = await _controller.Update(dto);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<StaffMemberDto>(ok.Value);

        Assert.Equal(staffDto.Id, val.Id);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenStaffNotFound()
    {
        var dto = new UpdateStaffMemberDto { MecNumber = "1234567" };
        _serviceMock.Setup(s => s.UpdateAsync(dto)).ReturnsAsync((StaffMemberDto?)null);

        var result = await _controller.Update(dto);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        var dto = new UpdateStaffMemberDto { MecNumber = "1234567" };
        _serviceMock.Setup(s => s.UpdateAsync(dto)).ThrowsAsync(new BusinessRuleValidationException("Error"));

        var result = await _controller.Update(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Error", bad.Value.ToString());
    }

    [Fact]
    public async Task ToggleStatus_ReturnsNotFound_WhenStaffNotFound()
    {
        _serviceMock.Setup(s => s.ToggleAsync(It.IsAny<string>())).ReturnsAsync((StaffMemberDto?)null);

        var result = await _controller.ToggleStatus("1234567");

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task ToggleStatus_ReturnsOk_WhenStaffFound()
    {
        var staffDto = BuildDto();

        _serviceMock.Setup(s => s.ToggleAsync(It.IsAny<string>())).ReturnsAsync(staffDto);

        var result = await _controller.ToggleStatus("1234567");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var val = Assert.IsType<StaffMemberDto>(ok.Value);

        Assert.Equal(staffDto.Id, val.Id);
    }

    [Fact]
    public async Task ToggleStatus_ReturnsBadRequest_OnBusinessRuleValidationException()
    {
        _serviceMock.Setup(s => s.ToggleAsync(It.IsAny<string>())).ThrowsAsync(new BusinessRuleValidationException("Error"));

        var result = await _controller.ToggleStatus("1234567");

        var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("Error", bad.Value.ToString());
    }
}
