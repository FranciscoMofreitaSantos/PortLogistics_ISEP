using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

namespace SEM5_PI_WEBAPI.utils.EmailTemplates;

public static class UpcomingDeletionDetailedEmailTemplate
{

    public static string Build(UserDataExportDto data, string requestId)
    {
        // Helpers simples para mostrar valores
        string BoolToYesNo(bool value, bool portuguese) => portuguese ? (value ? "Sim" : "Não") : (value ? "Yes" : "No");
        string OrDash(string? v) => string.IsNullOrWhiteSpace(v) ? "-" : v;

        var isSar = data.IsShippingAgentRepresentative && data.ShippingAgentRepresentative != null;
        var hasPrivacy = data.PrivacyPolicyConfirmations != null;

        var sar = data.ShippingAgentRepresentative;
        var pp = data.PrivacyPolicyConfirmations;

        var sarSectionPt = isSar
            ? $@"
      <h3 style='color:#1d3557; margin-top:24px;'>2. Dados de representante de agente de navegação (SAR)</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>SarId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{sar!.SarId}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Nome</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Name)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Documento de identificação</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.CitizenId)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Nacionalidade</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Nationality)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Email (SAR)</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Email)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Telemóvel</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.PhoneNumber)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Estado</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Status)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>SAO</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Sao)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>VVN Codes</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{(sar.VvnCodes != null && sar.VvnCodes.Count > 0 ? string.Join(", ", sar.VvnCodes) : "-")}</td>
        </tr>
      </table>"
            : @"
      <h3 style='color:#1d3557; margin-top:24px;'>2. Dados de representante de agente de navegação (SAR)</h3>
      <p style='color:#333;'>Não existem dados de SAR associados a esta conta.</p>";

        var ppSectionPt = hasPrivacy
            ? $@"
      <h3 style='color:#1d3557; margin-top:24px;'>3. Registos de aceitação de Política de Privacidade</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>Versão PP</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(pp!.VersionPrivacyPolicy)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Aceitou</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(pp.IsAccepted, true)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Data de aceitação (UTC)</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{(pp.AcceptedAtUtc?.ToString() ?? "-")}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Email registado</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(pp.UserEmail)}</td>
        </tr>
      </table>"
            : @"
      <h3 style='color:#1d3557; margin-top:24px;'>3. Registos de aceitação de Política de Privacidade</h3>
      <p style='color:#333;'>Não foram encontrados registos de aceitação de Política de Privacidade associados a esta conta.</p>";

        var sarSectionEn = isSar
            ? $@"
      <h3 style='color:#1d3557; margin-top:24px;'>2. Shipping Agent Representative (SAR) data</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>SarId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{sar!.SarId}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Name</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Name)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Citizen Id</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.CitizenId)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Nationality</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Nationality)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Email (SAR)</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Email)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Phone number</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.PhoneNumber)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Status</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Status)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>SAO</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(sar.Sao)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>VVN Codes</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{(sar.VvnCodes != null && sar.VvnCodes.Count > 0 ? string.Join(", ", sar.VvnCodes) : "-")}</td>
        </tr>
      </table>"
            : @"
      <h3 style='color:#1d3557; margin-top:24px;'>2. Shipping Agent Representative (SAR) data</h3>
      <p style='color:#333;'>No SAR data is associated with this account.</p>";

        var ppSectionEn = hasPrivacy
            ? $@"
      <h3 style='color:#1d3557; margin-top:24px;'>3. Privacy Policy acceptance records</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>PP version</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(pp!.VersionPrivacyPolicy)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Accepted</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(pp.IsAccepted, false)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Accepted at (UTC)</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{(pp.AcceptedAtUtc?.ToString() ?? "-")}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Registered email</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(pp.UserEmail)}</td>
        </tr>
      </table>"
            : @"
      <h3 style='color:#1d3557; margin-top:24px;'>3. Privacy Policy acceptance records</h3>
      <p style='color:#333;'>No Privacy Policy acceptance records were found for this account.</p>";

        return $@"
<html lang='pt'>
  <body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;'>
    <div style='max-width:800px; margin:40px auto; background:#ffffff; border-radius:8px; padding:24px; border:1px solid #e0e0e0;'>

      <!-- Portuguese section -->
      <h2 style='color:#1d3557;'>Aviso de eliminação de dados pessoais</h2>

      <p style='color:#333;'>Olá <strong>{data.Name}</strong>,</p>

      <p style='color:#333;'>
        Recebemos e estamos a processar o seu <strong>pedido de eliminação de dados pessoais</strong>
        associado ao email <strong>{data.Email}</strong> (ID do pedido: <strong>{requestId}</strong>).
      </p>

      <p style='color:#333;'>
        Abaixo encontra um resumo dos principais dados que serão <strong>apagados ou anonimizados</strong>, 
        salvo onde a lei exigir a sua retenção por motivos legais, fiscais ou de segurança.
      </p>

      <!-- Secção 1 – Dados de conta (PT) -->
      <h3 style='color:#1d3557; margin-top:24px;'>1. Dados de conta</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>UserId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{data.UserId}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Auth0UserId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Auth0UserId)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Nome</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Name)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Email</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Email)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Ativo</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(data.IsActive, true)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Eliminado (flag)</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(data.Eliminated, true)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Role</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Role)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Foto de perfil</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Picture)}</td>
        </tr>
      </table>

      {sarSectionPt}

      {ppSectionPt}

      <p style='color:#333; margin-top:16px;'>
        Se <strong>não</strong> foi você a submeter este pedido ou acredita que se trata de um erro, 
        contacte a nossa equipa de suporte <strong>o mais rapidamente possível</strong>, 
        antes de a eliminação ser executada.
      </p>

      <hr style='margin:32px 0; border:none; border-top:2px solid #ddd;' />

      <!-- English section -->
      <h2 style='color:#1d3557;'>Notice of personal data deletion</h2>

      <p style='color:#333;'>Hello <strong>{data.Name}</strong>,</p>

      <p style='color:#333;'>
        We are processing your <strong>personal data deletion request</strong> 
        associated with the email <strong>{data.Email}</strong> (Request ID: <strong>{requestId}</strong>).
      </p>

      <p style='color:#333;'>
        Below is a summary of the main data that will be <strong>deleted or anonymized</strong>, 
        except where the law requires retention for legal, tax, or security reasons.
      </p>

      <h3 style='color:#1d3557; margin-top:24px;'>1. Account data</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <tr>
          <td style='padding:6px; border:1px solid #ddd; width:30%;'><strong>UserId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{data.UserId}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Auth0UserId</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Auth0UserId)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Name</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Name)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Email</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Email)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Active</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(data.IsActive, false)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Deleted flag</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolToYesNo(data.Eliminated, false)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Role</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Role)}</td>
        </tr>
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'><strong>Profile picture</strong></td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(data.Picture)}</td>
        </tr>
      </table>

      {sarSectionEn}

      {ppSectionEn}

      <p style='color:#333; margin-top:16px;'>
        If you did <strong>not</strong> submit this request or believe it is a mistake, 
        please contact our support team <strong>as soon as possible</strong> 
        before the deletion is executed.
      </p>

      <hr style='margin:32px 0; border:none; border-top:1px solid #eee;' />

      <p style='font-size:0.9rem; color:#666; text-align:center;'>
        Atenciosamente / Best regards,<br/>
        <strong>Equipa de Gestão Portuária da ThPA / ThPA Port Management Team</strong>
      </p>
    </div>
  </body>
</html>";
    }
}
