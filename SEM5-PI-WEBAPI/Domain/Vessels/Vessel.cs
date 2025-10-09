using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class Vessel : Entity<VesselId>, IAggregateRoot
{
    private const int MinNameLength = 5;
    private const int MinOwnerNameLength = 5;
    
    
    public ImoNumber ImoNumber {get; private set;}
    public string Name {get; private set;}
    public string Owner {get; private set;}
    public VesselTypeId VesselTypeId {get; private set;}
    
    public Vessel(){}

    public Vessel(string imoNumber, string name, string owner,VesselTypeId type)
    {
        
        SetImoNumber(imoNumber);
        SetName(name);
        SetOwner(owner);
        SetVesselTypeId(type);
        this.Id = new VesselId(Guid.NewGuid());
    }

    public void UpdateName(string name) => SetName(name);
    public void UpdateOwner(string owner) => SetOwner(owner);
    private void UpdateImoNumber(string imoNumber) => SetImoNumber(imoNumber);
    private void UpdateVesselType(VesselTypeId id) => SetVesselTypeId(id);
    
    
    private void SetImoNumber(string imoNumber)
    {
        this.ImoNumber = new ImoNumber(imoNumber);
    }
    
    private void SetName(String name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new BusinessRuleValidationException("Name can't be null or whitespace.");
        if (name.Length < MinNameLength) throw new BusinessRuleValidationException($"Name length must be greater than or equal to {MinNameLength} characters.");
        
        this.Name = name;
    }

    private void SetOwner(string owner)
    {
        if (string.IsNullOrWhiteSpace(owner)) throw new BusinessRuleValidationException("Owner can't be null or whitespace.");
        if (owner.Length < MinOwnerNameLength) throw new BusinessRuleValidationException($"Owner Name must be greater than or equal to {MinOwnerNameLength} caracters.");
        
        this.Owner = owner;
    }

    private void SetVesselTypeId(VesselTypeId vesselTypeId)
    {
        if(vesselTypeId.Value.Equals(Guid.Empty)) throw new BusinessRuleValidationException("VesselTypeId can't be empty.");
        
        this.VesselTypeId = vesselTypeId;
    }
    
    
    public override bool Equals(object? obj) =>
        obj is Vessel otherVessel && this.ImoNumber.Value.Equals(otherVessel.ImoNumber.Value);

    public override int GetHashCode() => ImoNumber.GetHashCode();

    public override string ToString() => $"Vessel [Name: {Name}, Owner Name: {Owner}, IMO Number: {ImoNumber}, Vessel Type ID: {VesselTypeId}]";

}