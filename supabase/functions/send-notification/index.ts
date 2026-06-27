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
    const { to, name, patdNumber, details } = await req.json();

    if (!to || !patdNumber) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, patdNumber" }), {
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

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GPATD <onboarding@resend.dev>",
        to: [to],
        subject: `Novo Processo PATD Atribuído - Nº ${patdNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Notificação de Abertura de Processo</h2>
            <p>Olá, <strong>${name || "Apurador"}</strong>,</p>
            <p>Informamos que um novo Processo de Apuração de Transgressão Disciplinar (PATD) foi aberto e atribuído a você para apuração.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Número do PATD:</strong> ${patdNumber}</p>
              <p style="margin: 0;"><strong>Detalhes dos Fatos:</strong></p>
              <p style="margin: 5px 0 0 0; color: #475569; font-style: italic;">${details || "Não fornecido"}</p>
            </div>
            
            <p>Por favor, acesse o sistema GPATD para visualizar os detalhes completos e dar andamento ao processo.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">GPATD - Sistema de Apuração de Transgressão Disciplinar</p>
          </div>
        `,
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
