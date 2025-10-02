namespace SEM5_PI_WEBAPI.Domain.VesselsTypes
{
    public class VesselTypeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int MaxBays { get; set; }
        public int MaxRows { get; set; }
        public int MaxTiers { get; set; }
        public float Capacity { get; set; }

        
        //========== Constructors 
        
        public VesselTypeDto(Guid IdIn,string nameIn, string descriptionIn, int maxBaysIn,int maxRowsIn ,int maxTiersIn, float capacityIn)
        {
            this.Id = IdIn;
            this.Name = nameIn;
            this.Description = descriptionIn;
            this.MaxBays = maxBaysIn;
            this.MaxRows = maxRowsIn;
            this.MaxTiers = maxTiersIn;
            this.Capacity = capacityIn;
        }
    }
}