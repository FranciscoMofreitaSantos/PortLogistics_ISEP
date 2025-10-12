namespace SEM5_PI_WEBAPI.Domain.VesselsTypes.DTOs
{
    public class CreatingVesselTypeDto
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public int MaxBays { get; set; }
        public int MaxRows { get; set; }
        public int MaxTiers { get; set; }

        public CreatingVesselTypeDto(string nameIn,string? descriptionIn, int maxBaysIn,int maxRowsIn ,int maxTiersIn)
        {
            Name = nameIn;
            Description = descriptionIn;
            MaxBays = maxBaysIn;
            MaxRows = maxRowsIn;
            MaxTiers = maxTiersIn;
        }
    }
}

