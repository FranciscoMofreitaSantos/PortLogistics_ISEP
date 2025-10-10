using Newtonsoft.Json;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources;

public class PhysicalResourceId : EntityId
{
    [JsonConstructor]
    public PhysicalResourceId(Guid id) : base(id) {}
    
    public PhysicalResourceId(string value) :  base(value) {}

    protected override object createFromString(string text)
    {
        return new Guid(text);
    }

    public override string AsString()
    {
        Guid obj = (Guid)ObjValue;
        return obj.ToString();
    }

    public Guid AsGuid()
    {
        return (Guid)ObjValue;
    }
}