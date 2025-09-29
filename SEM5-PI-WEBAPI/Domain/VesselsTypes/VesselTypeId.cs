using System.Text.Json.Serialization;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.VesselsTypes
{
    public class VesselTypeId : EntityId
    {
        [JsonConstructor]
        public VesselTypeId(Guid value) : base(value)
        {
        }

        public VesselTypeId(String value) : base(value)
        {
        }
        
        override
            protected  Object createFromString(String text){
            return new Guid(text);
        }
        
        override
            public String AsString(){
            Guid obj = (Guid) base.ObjValue;
            return obj.ToString();
        }
        public Guid AsGuid(){
            return (Guid) base.ObjValue;
        }
    }
}

