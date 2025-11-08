namespace SEM5_PI_WEBAPI.utils.EmailTemplates;

public static class ActivationEmailTemplate
{
    public static string Build(string name, string email)
    {
        var activationLink = $"http://localhost:5173/activate?email={Uri.EscapeDataString(email)}";

        return $@"
        <html lang='pt'>
        <body style='font-family: Arial, sans-serif; background-color: #f9fafc; padding: 2rem;'>
            <div style='max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 2rem; box-shadow: 0 5px 20px rgba(0,0,0,0.1);'>

                
                <h2 style='color: #1d3557;'>Bem-vindo à Gestão Portuária da ThPA</h2>

                <p>Olá <strong>{name}</strong>,</p>

                <p>Para ativar a sua conta, clique no botão abaixo:</p>

                <a href='{activationLink}' 
                   style='display: inline-block; background: #1d3557; color: #fff; text-decoration: none; 
                          padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 1rem;'>
                    Ativar conta
                </a>

                <p style='margin-top: 1.5rem; color: #333;'>
                    Se o botão não funcionar, copie e cole este link no seu navegador:
                </p>

                <p style='word-break: break-all; color: #457b9d;'>{activationLink}</p>

                <hr style='margin: 2.5rem 0; border: none; border-top: 2px solid #ddd;' />

                
                <h2 style='color: #1d3557;'>Welcome to ThPA Port Management System</h2>

                <p>Hello <strong>{name}</strong>,</p>

                <p>To activate your account, please click the button below:</p>

                <a href='{activationLink}' 
                   style='display: inline-block; background: #1d3557; color: #fff; text-decoration: none; 
                          padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 1rem;'>
                    Activate account
                </a>

                <p style='margin-top: 1.5rem; color: #333;'>
                    If the button doesn’t work, please copy and paste this link into your browser:
                </p>

                <p style='word-break: break-all; color: #457b9d;'>{activationLink}</p>

                <hr style='margin: 2.5rem 0; border: none; border-top: 1px solid #eee;' />

                <p style='font-size: 0.9rem; color: #666;'>
                    Atenciosamente / Best regards,<br/>
                    <strong>Equipa de Gestão Portuária da ThPA / ThPA Port Management Team</strong>
                </p>
            </div>
        </body>
        </html>
        ";
    }
}