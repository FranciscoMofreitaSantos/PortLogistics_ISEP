using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.Qualifications;

namespace SEM5_PI_WEBAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QualificationsController
{
    private readonly QualificationService _service;

    public QualificationsController(QualificationService service)
    {
        _service = service;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QualificationDto>>> GetAll()
    {
        return await _service.GetAllAsync();
    }
}