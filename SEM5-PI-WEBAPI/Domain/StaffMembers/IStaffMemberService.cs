using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers
{
    public interface IStaffMemberService
    {
        Task<List<StaffMemberDto>> GetAllAsync();
        Task<StaffMemberDto?> GetByIdAsync(StaffMemberId id);
        Task<StaffMemberDto?> GetByMecNumberAsync(string mecNumber);
        Task<List<StaffMemberDto>> GetByNameAsync(string name);
        Task<List<StaffMemberDto>> GetByStatusAsync(bool status);
        Task<List<StaffMemberDto>> GetByQualificationsAsync(List<string> codes);
        Task<List<StaffMemberDto>> GetByExactQualificationsAsync(List<string> codes);
        Task<StaffMemberDto> AddAsync(CreatingStaffMemberDto dto);
        Task<StaffMemberDto> UpdateAsync(UpdateStaffMemberDto updateDto);
        Task<StaffMemberDto?> ToggleAsync(string mec);
    }
}