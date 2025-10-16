using System.Text.Json;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;
using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations.DTOs;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;
using SEM5_PI_WEBAPI.Domain.Vessels;
using SEM5_PI_WEBAPI.Domain.Vessels.DTOs;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;
using SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs;
using SEM5_PI_WEBAPI.Domain.VVN;
using SEM5_PI_WEBAPI.Domain.VVN.DTOs;

namespace SEM5_PI_WEBAPI.Seed;

public class Bootstrap
{
    private readonly IVesselTypeService _vesselTypeService;
    private readonly IVesselService _vesselService;
    private readonly IShippingAgentOrganizationService _shippingAgentOrganizationService;
    private readonly IQualificationService _qualificationService;
    private readonly IStaffMemberService _staffMemberService;
    private readonly IVesselVisitNotificationService _vesselVisitNotificationService;
    private readonly ILogger<Bootstrap> _logger;

    // Cache local
    private readonly List<VesselTypeDto> _vesselsTypes = new();
    private readonly List<ShippingAgentOrganizationDto> _saoList = new();

    public Bootstrap(
        ILogger<Bootstrap> logger,
        IVesselTypeService vesselTypeService,
        IVesselService vesselService,
        IShippingAgentOrganizationService shippingAgentOrganizationService,
        IVesselVisitNotificationService vesselVisitNotificationService,
        IQualificationService qualificationService,
        IStaffMemberService staffMemberService)
    {
        _logger = logger;
        _vesselTypeService = vesselTypeService;
        _vesselService = vesselService;
        _shippingAgentOrganizationService = shippingAgentOrganizationService;
        _qualificationService = qualificationService;
        _staffMemberService = staffMemberService;
        _vesselVisitNotificationService = vesselVisitNotificationService;
    }

    public async Task SeedAsync()
    {
        _logger.LogInformation("[Bootstrap] Starting JSON-based data seeding...");

        await SeedVesselTypesAsync("Seed/VesselsTypes.json");
        await SeedVesselsAsync("Seed/Vessels.json");
        await SeedShippingAgentOrganizationsAsync("Seed/ShippingAgents.json");
        await SeedQualificationsAsync("Seed/Qualifications.json");
        await SeedStaffMembersAsync("Seed/StaffMembers.json");
        await SeedVesselVisitNotificationsAsync("Seed/VesselVisitNotifications.json");
        

        _logger.LogInformation("[Bootstrap] JSON data seeding completed successfully.");
    }


    // ===============================================================
    // JSON SEED HELPERS
    // ===============================================================

    private async Task SeedVesselTypesAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Vessel Types from {Path}", filePath);

        var vesselTypes = await LoadJsonAsync<CreatingVesselTypeDto>(filePath);
        if (vesselTypes == null) return;

        foreach (var dto in vesselTypes)
        {
            try
            {
                var created = await _vesselTypeService.AddAsync(dto);
                _vesselsTypes.Add(created);
                _logger.LogInformation("[Bootstrap] Vessel Type '{Name}' created successfully.", dto.Name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not update Vessel Type'{IMO}': {Message}", dto.Name, ex.Message);
            }
        }
    }

    private async Task SeedVesselsAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Vessels from {Path}", filePath);

        var vessels = await LoadJsonAsync<CreatingVesselDto>(filePath);
        if (vessels == null) return;

        foreach (var dto in vessels)
        {
            try
            {
                await _vesselService.CreateAsync(dto);
                _logger.LogInformation("[Bootstrap] Vessel '{Name}' ({IMO}) created successfully.", dto.Name,
                    dto.ImoNumber);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not update Vessel '{IMO}': {Message}", dto.ImoNumber, ex.Message);
            }
        }
    }

    private async Task SeedShippingAgentOrganizationsAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Shipping Agents from {Path}", filePath);

        var agents = await LoadJsonAsync<CreatingShippingAgentOrganizationDto>(filePath);
        if (agents == null) return;

        foreach (var dto in agents)
        {
            try
            {
                var created = await _shippingAgentOrganizationService.CreateAsync(dto);
                _saoList.Add(created);
                _logger.LogInformation("[Bootstrap] SAO '{AltName}' ({TaxNumber}) created successfully.", dto.AltName,
                    dto.Taxnumber);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not update SAO '{AltName}': {Message}", dto.AltName, ex.Message);
            }
        }
    }

    private async Task SeedQualificationsAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Qualifications from {Path}", filePath);

        var qualifications = await LoadJsonAsync<CreatingQualificationDto>(filePath);
        if (qualifications == null) return;

        foreach (var dto in qualifications)
        {
            try
            {
                await _qualificationService.AddAsync(dto);
                _logger.LogInformation("[Bootstrap] Qualification '{Name}' created successfully.", dto.Name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not add Qualification '{Name}': {Message}", dto.Name, ex.Message);
            }
        }
    }

    private async Task SeedStaffMembersAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Staff Members from {Path}", filePath);

        var staff = await LoadJsonAsync<CreatingStaffMemberDto>(filePath);
        if (staff == null) return;

        foreach (var dto in staff)
        {
            try
            {
                await _staffMemberService.AddAsync(dto);
                _logger.LogInformation("[Bootstrap] Staff Member '{ShortName}' created successfully.", dto.ShortName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not add Staff Member '{ShortName}': {Message}", dto.ShortName,
                    ex.Message);
            }
        }
    }
    private async Task SeedVesselVisitNotificationsAsync(string filePath)
    {
        _logger.LogInformation("[Bootstrap] Loading Vessel Visit Notifications from {Path}", filePath);

        var vvn = await LoadJsonAsync<CreatingVesselVisitNotificationDto>(filePath);
        if (vvn == null) return;

        foreach (var v in vvn)
        {
            try
            {
                var r = await _vesselVisitNotificationService.AddAsync(v);
                _logger.LogInformation("[Bootstrap] Vessel Visit Notification '{id}' created successfully.", r.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Bootstrap] Could not add Vessel Visit Notification: {Message}",
                    ex.Message);
            }
        }
    }


    // ===============================================================
    // GENERIC JSON LOADER
    // ===============================================================
    private async Task<List<T>?> LoadJsonAsync<T>(string path)
    {
        if (!File.Exists(path))
        {
            _logger.LogWarning("[Bootstrap] JSON file not found: {Path}", path);
            return null;
        }

        try
        {
            using var stream = File.OpenRead(path);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return await JsonSerializer.DeserializeAsync<List<T>>(stream, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Bootstrap] Failed to parse JSON file: {Path}", path);
            return null;
        }
    }
}