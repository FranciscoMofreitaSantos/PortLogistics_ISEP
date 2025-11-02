using Microsoft.AspNetCore.Mvc;

namespace SEM5_PI_WEBAPI.utils;

public class ResponsesToFrontend : IResponsesToFrontend
{
    public ActionResult ProblemResponse(string title, string detail, int status)
    {
        return new ObjectResult(new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = status
        }) { StatusCode = status };
    }
}