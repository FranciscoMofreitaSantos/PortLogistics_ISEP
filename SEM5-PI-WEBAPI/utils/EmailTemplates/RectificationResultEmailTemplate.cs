using System.Text;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

namespace SEM5_PI_WEBAPI.utils.EmailTemplates;

public static class RectificationResultEmailTemplate
{
    public static string Build(
        string userName,
        string userEmail,
        string requestId,
        RectificationPayloadDto requested,
        RectificationApplyDto applied)
    {
        string OrDash(string? v) => string.IsNullOrWhiteSpace(v) ? "-" : v;

        string BoolPt(bool? v) => v == null ? "-" : (v.Value ? "Sim" : "Não");
        string BoolEn(bool? v) => v == null ? "-" : (v.Value ? "Yes" : "No");

        string StatusPt(string? requestedVal, string? finalVal)
        {
            if (requestedVal == null) return "-";
            if (finalVal == null) return "Não alterado";
            if (finalVal == requestedVal) return "Alterado conforme pedido";
            return "Alterado com valor diferente do pedido";
        }

        string StatusPtBool(bool? requestedVal, bool? finalVal)
        {
            if (requestedVal == null) return "-";
            if (finalVal == null) return "Não alterado";
            if (finalVal == requestedVal) return "Alterado conforme pedido";
            return "Alterado com valor diferente do pedido";
        }

        string StatusEn(string? requestedVal, string? finalVal)
        {
            if (requestedVal == null) return "-";
            if (finalVal == null) return "Not changed";
            if (finalVal == requestedVal) return "Changed as requested";
            return "Changed with a different value";
        }

        string StatusEnBool(bool? requestedVal, bool? finalVal)
        {
            if (requestedVal == null) return "-";
            if (finalVal == null) return "Not changed";
            if (finalVal == requestedVal) return "Changed as requested";
            return "Changed with a different value";
        }

        string Reason(string? fieldReason, string? globalReason)
            => !string.IsNullOrWhiteSpace(fieldReason)
                ? fieldReason!
                : (!string.IsNullOrWhiteSpace(globalReason) ? globalReason! : "-");

        var rowsPt = new StringBuilder();
        var rowsEn = new StringBuilder();

        void AddField(
            string fieldLabelPt,
            string fieldLabelEn,
            string? requestedVal,
            string? finalVal,
            string? fieldReason)
        {
            if (requestedVal == null) return; // campo não foi pedido

            var statusPt = StatusPt(requestedVal, finalVal);
            var statusEn = StatusEn(requestedVal, finalVal);

            var reasonPt = Reason(fieldReason, applied.GlobalReason);
            var reasonEn = reasonPt; // se quiseres, podes ter traduções separadas

            rowsPt.AppendLine($@"
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'>{fieldLabelPt}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(requestedVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(finalVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>
            <strong>{statusPt}</strong><br/>{OrDash(reasonPt)}
          </td>
        </tr>");

            rowsEn.AppendLine($@"
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'>{fieldLabelEn}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(requestedVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{OrDash(finalVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>
            <strong>{statusEn}</strong><br/>{OrDash(reasonEn)}
          </td>
        </tr>");
        }

        void AddBoolField(
            string fieldLabelPt,
            string fieldLabelEn,
            bool? requestedVal,
            bool? finalVal,
            string? fieldReason)
        {
            if (requestedVal == null) return;

            var statusPt = StatusPtBool(requestedVal, finalVal);
            var statusEn = StatusEnBool(requestedVal, finalVal);

            var reasonPt = Reason(fieldReason, applied.GlobalReason);
            var reasonEn = reasonPt;

            rowsPt.AppendLine($@"
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'>{fieldLabelPt}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolPt(requestedVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolPt(finalVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>
            <strong>{statusPt}</strong><br/>{OrDash(reasonPt)}
          </td>
        </tr>");

            rowsEn.AppendLine($@"
        <tr>
          <td style='padding:6px; border:1px solid #ddd;'>{fieldLabelEn}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolEn(requestedVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>{BoolEn(finalVal)}</td>
          <td style='padding:6px; border:1px solid #ddd;'>
            <strong>{statusEn}</strong><br/>{OrDash(reasonEn)}
          </td>
        </tr>");
        }

        // ===== USER FIELDS =====
        AddField(
            "Nome", "Name",
            requested.NewName,
            applied.FinalName,
            applied.FinalNameReason);

        AddField(
            "Email", "Email",
            requested.NewEmail,
            applied.FinalEmail,
            applied.FinalEmailReason);

        AddField(
            "Foto de perfil", "Profile picture",
            requested.NewPicture,
            applied.FinalPicture,
            applied.FinalPictureReason);

        AddBoolField(
            "Ativo", "Active",
            requested.IsActive,
            applied.FinalIsActive,
            applied.FinalIsActiveReason);

        // ===== SAR FIELDS =====
        AddField(
            "Telemóvel (SAR)", "Phone (SAR)",
            requested.NewPhoneNumber,
            applied.FinalPhoneNumber,
            applied.FinalPhoneNumberReason);

        AddField(
            "Nacionalidade (SAR)", "Nationality (SAR)",
            requested.NewNationality,
            applied.FinalNationality,
            applied.FinalNationalityReason);

        AddField(
            "Documento de identificação (SAR)", "Citizen Id (SAR)",
            requested.NewCitizenId,
            applied.FinalCitizenId,
            applied.FinalCitizenIdReason);

        var globalComment = OrDash(applied.AdminGeneralComment);
        var globalStatusPt = applied.RejectEntireRequest
            ? "O pedido foi rejeitado na totalidade."
            : "O pedido foi analisado e os campos acima foram tratados conforme indicado.";
        var globalStatusEn = applied.RejectEntireRequest
            ? "The request was fully rejected."
            : "The request was reviewed and the fields above were handled as indicated.";

        return $@"
<html lang='pt'>
  <body style='font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;'>
    <div style='max-width:800px; margin:40px auto; background:#ffffff; border-radius:8px; padding:24px; border:1px solid #e0e0e0;'>

      <!-- Portuguese section -->
      <h2 style='color:#1d3557;'>Resultado do pedido de retificação de dados</h2>

      <p style='color:#333;'>Olá <strong>{userName}</strong>,</p>

      <p style='color:#333;'>
        O seu pedido de <strong>retificação de dados pessoais</strong> associado ao email 
        <strong>{userEmail}</strong> (ID do pedido: <strong>{requestId}</strong>) foi analisado por um administrador.
      </p>

      <p style='color:#333;'>
        Na tabela seguinte pode ver, para cada campo pedido, o valor solicitado, o valor que foi efetivamente aplicado
        e a decisão/motivo correspondente.
      </p>

      <h3 style='color:#1d3557; margin-top:24px;'>Detalhe das alterações (PT)</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <thead>
          <tr>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Campo</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Valor pedido</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Valor aplicado</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Decisão &amp; motivo</th>
          </tr>
        </thead>
        <tbody>
          {rowsPt}
        </tbody>
      </table>

      <p style='color:#333; margin-top:16px;'>
        {globalStatusPt}
      </p>

      <p style='color:#333; margin-top:8px;'>
        Comentário geral do administrador: {globalComment}
      </p>

      <hr style='margin:32px 0; border:none; border-top:2px solid #ddd;' />

      <!-- English section -->
      <h2 style='color:#1d3557;'>Result of your data rectification request</h2>

      <p style='color:#333;'>Hello <strong>{userName}</strong>,</p>

      <p style='color:#333;'>
        Your <strong>personal data rectification request</strong> associated with the email 
        <strong>{userEmail}</strong> (Request ID: <strong>{requestId}</strong>) has been reviewed by an administrator.
      </p>

      <p style='color:#333;'>
        In the table below you can see, for each requested field, the requested value, the final applied value
        and the decision/reason.
      </p>

      <h3 style='color:#1d3557; margin-top:24px;'>Change details (EN)</h3>
      <table style='width:100%; border-collapse:collapse; font-size:0.95rem;'>
        <thead>
          <tr>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Field</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Requested value</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Applied value</th>
            <th style='padding:6px; border:1px solid #ddd; background:#f1f1f1;'>Decision &amp; reason</th>
          </tr>
        </thead>
        <tbody>
          {rowsEn}
        </tbody>
      </table>

      <p style='color:#333; margin-top:16px;'>
        {globalStatusEn}
      </p>

      <p style='color:#333; margin-top:8px;'>
        Administrator overall comment: {globalComment}
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
