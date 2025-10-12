namespace SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs
{
    public class UpdateVesselTypeDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? MaxBays { get; set; }
        public int? MaxRows { get; set; }
        public int? MaxTiers { get; set; }
    }
}
