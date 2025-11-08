using SEM5_PI_WEBAPI.utils.Dtos;

namespace SEM5_PI_WEBAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.utils; 

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailSender _emailSender;

    public EmailController(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    [HttpGet("test")]
    public async Task<IActionResult> SendTestEmail(SendEmailDto emailDto)
    {
        
        try
        {
            await _emailSender.SendEmailAsync(emailDto.Receiver, emailDto.Subject, emailDto.Message);
            return Ok("Email sent successfully!");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error sending email: {ex.Message}");
        }
    }
}