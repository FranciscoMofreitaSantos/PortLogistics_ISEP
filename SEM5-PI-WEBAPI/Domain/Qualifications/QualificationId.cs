using System.Text.Json.Serialization;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class QualificationId : EntityId
{
    [JsonConstructor]
    public QualificationId(Guid value) : base(value) {}
    
    public QualificationId(string value) : base(value){}

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
    
    public override bool Equals(object? obj)
    {
        if (obj is QualificationId other)
            return AsGuid().Equals(other.AsGuid());
        return false;
    }

    public override int GetHashCode()
    {
        return AsGuid().GetHashCode();
    }

}