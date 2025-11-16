namespace SEM5_PI_WEBAPI.Controllers;

using Microsoft.AspNetCore.Mvc;
using System.IO;
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

#if NET9_0_WINDOWS
using System.Media;
using NAudio.CoreAudioApi;
#endif


[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    [HttpGet("iniciar")]
    public IActionResult IniciarPrank()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
#if NET9_0_WINDOWS
            try
            {
                var enumerator = new MMDeviceEnumerator();
                var device = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                
                device.AudioEndpointVolume.MasterVolumeLevelScalar = 1.0f;
                device.AudioEndpointVolume.Mute = false; 
                
                string soundPath = Path.Combine(AppContext.BaseDirectory, "client-ui/src/assets/success.mp3);
                if (System.IO.File.Exists(soundPath))
                {
                    SoundPlayer player = new SoundPlayer(soundPath);
                    player.Play();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO NA PRANK (WINDOWS): {ex.Message}");
            }
#else
            Console.WriteLine("PRANK SKIP: Compilado sem APIs do Windows.");
            TriggerRickRoll(); 
#endif
        }
        else
        {
            Console.WriteLine("PRANK SKIP: Rodando em Mac/Linux.");
            TriggerRickRoll(); 
        }

        return Ok(">:D");
    }
    private void TriggerRickRoll()
    {
        string url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

        try
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // O que já funciona
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) // OSX = macOS
            {
                // O comando correto para Mac
                Process.Start("open", url);
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                // O comando padrão para Linux (desktop)
                Process.Start("xdg-open", url);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERRO NO PLANO B (TriggerRickRoll): {ex.Message}");
        }
    }
}