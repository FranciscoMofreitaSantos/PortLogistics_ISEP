namespace SEM5_PI_DecisionEngineAPI.DTOs
{
    public class DockDto
    {
        public Guid Id { get; set; }
        public DockCodeDto Code { get; set; }
        public List<PhysicalResourceCodeDto> PhysicalResourceCodes { get; set; }
        public string Location { get; set; }
        public double LengthM { get; set; }
        public double DepthM { get; set; }
        public double MaxDraftM { get; set; }
        public string Status { get; set; }  
        public List<VesselTypeIdDto> AllowedVesselTypeIds { get; set; }
    }

    public class DockCodeDto
    {
        public string Value { get; set; }
    }

    public class PhysicalResourceCodeDto
    {
        public string Value { get; set; }
    }

    public class VesselTypeIdDto
    {
        public Guid Value { get; set; }
    }
}