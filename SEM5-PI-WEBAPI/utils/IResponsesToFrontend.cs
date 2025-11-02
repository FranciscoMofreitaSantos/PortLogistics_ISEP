using Microsoft.AspNetCore.Mvc;

namespace SEM5_PI_WEBAPI.utils;

public interface IResponsesToFrontend
{
    ActionResult ProblemResponse(string title, string detail, int status);
}