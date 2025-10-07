namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public class RegisterDockDto
    {
        public string Code { get; set; } = null!;
        public string Location { get; set; } = null!;
        public double LengthM  { get; set; }
        public double DepthM   { get; set; }
        public double MaxDraftM { get; set; }

        public List<string> AllowedVesselTypeIds { get; set; } = new();

        public RegisterDockDto() { }

        public RegisterDockDto(
            string code,
            string location,
            double lengthM,
            double depthM,
            double maxDraftM,
            IEnumerable<string> allowedVesselTypeIds)
        {
            Code = code;
            Location = location;
            LengthM = lengthM;
            DepthM = depthM;
            MaxDraftM = maxDraftM;
            AllowedVesselTypeIds = allowedVesselTypeIds?.ToList() ?? new List<string>();
        }
    }
}