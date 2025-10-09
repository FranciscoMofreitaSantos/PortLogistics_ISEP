using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.VesselsTypes;

public class VesselTypeId : EntityId
{
    public VesselTypeId(Guid value) : base(value)
    {
        if (value == Guid.Empty)
            throw new BusinessRuleValidationException("VesselTypeId cannot be empty.");
    }

    public VesselTypeId(string value) : base(value)
    {
        if (Guid.Parse(value) == Guid.Empty)
            throw new BusinessRuleValidationException("VesselTypeId cannot be empty.");
    }

    protected override object createFromString(string text) => new Guid(text);

    public override string AsString()
    {
        Guid obj = (Guid)ObjValue;
        return obj.ToString();
    }

    public Guid AsGuid() => (Guid)ObjValue;
}