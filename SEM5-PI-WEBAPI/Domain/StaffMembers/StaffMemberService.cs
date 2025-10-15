using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers;

public class StaffMemberService : IStaffMemberService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStaffMemberRepository _repo;
    private readonly IQualificationRepository _repoQualifications;

    public StaffMemberService(IUnitOfWork unitOfWork, IStaffMemberRepository repo,
        IQualificationRepository repoQualifications)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
        _repoQualifications = repoQualifications;
    }

    public async Task<List<StaffMemberDto>> GetAllAsync()
    {
        var list = await _repo.GetAllAsync();
        var dtos = await Task.WhenAll(list.Select(MapToDto));
        return dtos.ToList();
    }

    public async Task<StaffMemberDto?> GetByIdAsync(StaffMemberId id)
    {
        var staff = await _repo.GetByIdAsync(id);
        return staff == null ? null : await MapToDto(staff);
    }

    public async Task<StaffMemberDto?> GetByMecNumberAsync(string m)
    {
        var mec = new MecanographicNumber(m);
        var staff = await _repo.GetByMecNumberAsync(mec);
        return staff == null ? null : await MapToDto(staff);
    }

    public async Task<List<StaffMemberDto>> GetByNameAsync(string name)
    {
        var staff = await _repo.GetByNameAsync(name);
        var dtos = await Task.WhenAll(staff.Select(MapToDto));
        return dtos.ToList();
    }

    public async Task<List<StaffMemberDto>> GetByStatusAsync(bool status)
    {
        var staff = await _repo.GetByStatusAsync(status);
        var dtos = await Task.WhenAll(staff.Select(MapToDto));
        return dtos.ToList();
    }

    public async Task<List<StaffMemberDto>> GetByQualificationsAsync(List<string> codes)
    {
        var ids = await GetQualificationIdsFromCodesAsync(codes);
        var staff = await _repo.GetByQualificationsAsync(ids);
        var dtos = await Task.WhenAll(staff.Select(MapToDto));
        return dtos.ToList();
    }

    public async Task<List<StaffMemberDto>> GetByExactQualificationsAsync(List<string> codes)
    {
        var ids = await GetQualificationIdsFromCodesAsync(codes);
        var staff = await _repo.GetByExactQualificationsAsync(ids);
        var dtos = await Task.WhenAll(staff.Select(MapToDto));
        return dtos.ToList();
    }

    
    public async Task<StaffMemberDto> AddAsync(CreatingStaffMemberDto dto)
    {
        await EnsureNotRepeatedEmailAsync(new Email(dto.Email));
        await EnsureNotRepeatedPhoneAsync(new PhoneNumber(dto.Phone));

        var qualificationCodes = dto.QualificationCodes;
        List<QualificationId> qualificationIds = new();

        if (qualificationCodes != null)
        {
            qualificationIds = await LoadQualificationsAsync(qualificationCodes);
        }

        var mecanographicNumber = await GenerateMecanographicNumberAsync();
        var daysEnum = Schedule.ParseDaysFromBinary(dto.Schedule.DaysOfWeek);
        var staffMember = new StaffMember(
            dto.ShortName,
            new MecanographicNumber(mecanographicNumber),
            new Email(dto.Email),
            new PhoneNumber(dto.Phone),
            new Schedule(dto.Schedule.Shift, daysEnum),
            qualificationIds
        );

        await _repo.AddAsync(staffMember);
        await _unitOfWork.CommitAsync();

        return await MapToDto(staffMember);
    }

    public async Task<StaffMemberDto> UpdateAsync(UpdateStaffMemberDto updateDto)
    {
        var staff = await _repo.GetByMecNumberAsync(new MecanographicNumber(updateDto.MecNumber));
        if (staff == null)
            throw new BusinessRuleValidationException($"No StaffMember with mec number: {updateDto.MecNumber}");

        if (updateDto.Email != null)
        {
            var emailToCheck = new Email(updateDto.Email);
            await EnsureNotRepeatedEmailAsync(emailToCheck);
        }

        if (updateDto.Phone != null)
        {
            var phoneToCheck = new PhoneNumber(updateDto.Phone);
            await EnsureNotRepeatedPhoneAsync(phoneToCheck);
        }

        if (updateDto.ShortName != null)
            staff.UpdateShortName(updateDto.ShortName);

        if (updateDto.Email != null)
            staff.UpdateEmail(new Email(updateDto.Email));

        if (updateDto.Phone != null)
            staff.UpdatePhone(new PhoneNumber(updateDto.Phone));

        if (updateDto.Schedule != null)
            staff.UpdateSchedule(updateDto.Schedule.ToDomain());

        if (updateDto.IsActive.HasValue)
            staff.IsActive = updateDto.IsActive.Value;

        if (updateDto.QualificationCodes != null && updateDto.AddQualifications == null)
        {
            throw new BusinessRuleValidationException(
                "Please specify whether you want to add or just replace the qualifications provided.");
        }

        if (updateDto.QualificationCodes != null && updateDto.AddQualifications == true)
        {
            foreach (var code in updateDto.QualificationCodes)
            {
                var qualification = await _repoQualifications.GetQualificationByCodeAsync(code);
                if (qualification != null)
                {
                    staff.AddQualification(qualification.Id);
                }
                else
                {
                    throw new BusinessRuleValidationException($"Qualification Code: {code} not in Database");
                }
            }
        }
        else if (updateDto.QualificationCodes != null && updateDto.AddQualifications == false)
        {
            var qualificationIds = new List<QualificationId>();
            foreach (var code in updateDto.QualificationCodes)
            {
                var qualification = await _repoQualifications.GetQualificationByCodeAsync(code);
                if (qualification != null)
                {
                    qualificationIds.Add(qualification.Id);
                }
                else
                {
                    throw new BusinessRuleValidationException($"Qualification Code: {code} not in Database");
                }
            }
            
            staff.SetQualifications(qualificationIds);
        }

        await _unitOfWork.CommitAsync();
        return await MapToDto(staff);
    }

    public async Task<StaffMemberDto?> ToggleAsync(string mec)
    {
        var staff = await _repo.GetByMecNumberAsync(new MecanographicNumber(mec));
        if (staff == null)
            return null;

        staff.ToggleStatus();
        await _unitOfWork.CommitAsync();

        return await MapToDto(staff);
    }

    private async Task EnsureNotRepeatedEmailAsync(Email email)
    {
        bool repeatedEmail = await _repo.EmailIsInTheSystem(email);
        if (repeatedEmail)
            throw new BusinessRuleValidationException("Repeated Email for StaffMember!");
    }

    private async Task EnsureNotRepeatedPhoneAsync(PhoneNumber phone)
    {
        bool repeatedPhone = await _repo.PhoneIsInTheSystem(phone);
        if (repeatedPhone)
            throw new BusinessRuleValidationException("Repeated Phone Number for StaffMember!");
    }

    private async Task<List<QualificationId>> LoadQualificationsAsync(List<string> codes)
    {
        var qualificationIds = new List<QualificationId>();
        foreach (var code in codes)
        {
            var q = await _repoQualifications.GetQualificationByCodeAsync(code);
            if (q == null)
                throw new BusinessRuleValidationException($"Invalid Qualification Code: {code}");
            qualificationIds.Add(q.Id);
        }

        return qualificationIds;
    }

    private async Task<string> GenerateMecanographicNumberAsync()
    {
        var allStaff = await _repo.GetAllAsync();
        var currentYear = DateTime.UtcNow.Year % 100;

        var count = allStaff.Count(s =>
        {
            if (s.MecanographicNumber == null) return false;
            return s.MecanographicNumber.Year == currentYear;
        });

        var nextSeq = count + 1;
        return $"1{currentYear:D2}{nextSeq:D4}";
    }
    
    private async Task<List<QualificationId>> GetQualificationIdsFromCodesAsync(List<string> codes)
    {
        var ids = new List<QualificationId>();

        if (codes == null || !codes.Any())
            return ids;

        foreach (var code in codes)
        {
            var q = await _repoQualifications.GetQualificationByCodeAsync(code);
            if (q != null)
                ids.Add(q.Id);
        }

        if (codes.Count() != ids.Count())
            throw new BusinessRuleValidationException("Please review the qualifications provided, some do not exist!");

        return ids;
    }

    private async Task<StaffMemberDto> MapToDto(StaffMember staff)
    {
        List<string> codes = new();

        if (staff.Qualifications != null)
        {
            foreach (var q in staff.Qualifications)
            {
                var qualification = await _repoQualifications.GetByIdAsync(q);
                codes.Add(qualification.Code);
            }
        }

        return new StaffMemberDto(
            staff.Id.AsGuid(),
            staff.ShortName,
            staff.MecanographicNumber.Value,
            staff.Email.ToString(),
            staff.Phone.ToString(),
            new ScheduleDto(staff.Schedule.Shift, staff.Schedule.DaysToBinary()),
            staff.IsActive,
            staff.Qualifications != null ? codes : new List<string>()
        );
    }
}