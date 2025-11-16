namespace SEM5_PI_DecisionEngineAPI.DTOs;

public class StaffMemberDto
{
    public Guid Id { get; set; }
    public string ShortName { get; set; }
    public string MecanographicNumber { get; private set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public ScheduleDto Schedule { get; set; }
    public bool IsActive { get; set; }
    public List<string> QualificationCodes { get; }

    public class ScheduleDto
    {
        public string Shift { get; set; }
        public string DaysOfWeek { get; set; }
    }

}