import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { to, name, patdNumber, details, documentUrl, documentName, senderPhone, senderExtension, senderEmail, subject, body } = await req.json();

    if (!to || (!patdNumber && !subject)) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, and either patdNumber or subject" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured on Supabase" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    let emailSubject = subject || `Novo Processo PATD Atribuído - Nº ${patdNumber}`;
    let emailHtml = "";

    if (body) {
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155; line-height: 1.6;">
          <div style="white-space: pre-wrap;">${body}</div>
          
          <p style="margin: 25px 0 10px 0;"><a href="https://www.gpatdafa.com" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600;">www.gpatdafa.com</a></p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">GPATD - Sistema de Apuração de Transgressão Disciplinar</p>
        </div>
      `;
    } else {
      let docSection = "";
      if (documentUrl) {
        docSection = `
          <div style="margin: 25px 0; text-align: center;">
            <a href="${documentUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
              Visualizar Documento Anexo (${documentName || "PDF"})
            </a>
          </div>
        `;
      }
      
      emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155; line-height: 1.6;">
          <p>Olá, <strong>${name || "Apurador"}</strong>,</p>
          <p>Informamos que um novo Processo de Apuração de Transgressão Disciplinar (PATD), foi aberto e atribuído a você para apuração.</p>
          <p><strong>Número do PATD:</strong> ${patdNumber}</p>
          
          ${docSection}

          <p>Por favor, acesse o sistema GPATD para visualizar os detalhes completos e dar andamento ao processo.</p>
          
          <p style="margin: 15px 0 10px 0;"><a href="https://www.gpatdafa.com" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600;">www.gpatdafa.com</a></p>
          
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            <strong>Telefone:</strong> ${senderPhone || "—"}<br/>
            <strong>Ramal:</strong> ${senderExtension || "—"}<br/>
            <strong>E-mail:</strong> ${senderEmail || "—"}
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">GPATD - Sistema de Apuração de Transgressão Disciplinar</p>
        </div>
      `;
    }

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GPATD <nao-responder@gpatdafa.com>",
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: result.message || "Failed to send email via Resend" }), {
        status: response.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
