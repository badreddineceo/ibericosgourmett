// api/order.js - Vercel Serverless Function
// Recibe el formulario de pedido a contrarrembolso y envía un email con todos los datos a tu Gmail mediante API

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Solo POST.' });
  }

  try {
    const {
      nombre,
      calle,
      ciudad,
      provincia,
      codigoPostal,
      telefono,
      pack,
      notas,
      referencia
    } = req.body || {};

    // Validar campos obligatorios solicitados
    if (!nombre || !calle || !ciudad || !provincia || !codigoPostal || !telefono) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios (nombre, calle, ciudad, provincia, código postal o teléfono).'
      });
    }

    // Determinar precio y descripción según el pack
    const isPack10 = pack === 'pack-10' || pack === '10' || (typeof pack === 'string' && pack.includes('10'));
    const packNombre = isPack10 
      ? 'Pack Gourmet Familiar: 10 Sobres de 100g (1 Kg) - Cortado a Cuchillo' 
      : 'Pack Degustación: 5 Sobres de 100g (500g) - Cortado a Cuchillo';
    const totalPagar = isPack10 ? '58,00 €' : '30,00 €';
    const numSobres = isPack10 ? '10 sobres de 100g (Cortados a Cuchillo)' : '5 sobres de 100g (Cortados a Cuchillo)';

    const orderRef = referencia || `JAM-${Date.now().toString().slice(-6)}`;
    const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    // Construir enlace de WhatsApp directo para facilitar el contacto con el cliente
    const telLimpio = telefono.replace(/\D/g, '');
    const telConPrefijo = telLimpio.startsWith('34') ? telLimpio : `34${telLimpio}`;
    const whatsappLink = `https://wa.me/${telConPrefijo}?text=${encodeURIComponent(
      `Hola ${nombre}, te escribimos de Jamón Ibérico de Guijuelo para confirmar la entrega de tu pedido #${orderRef} a contrarrembolso (${totalPagar}). ¿La dirección ${calle}, ${ciudad} es correcta?`
    )}`;

    // Contenido del email en formato HTML moderno
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #780016 0%, #4a000d 100%); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0 0 6px 0; font-size: 22px; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 14px; opacity: 0.9; }
          .badge { display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-top: 10px; }
          .content { padding: 24px; }
          .price-box { background: #fff8f0; border: 2px dashed #D4AF37; border-radius: 10px; padding: 16px; margin: 20px 0; text-align: center; }
          .price-title { font-size: 13px; color: #780016; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .price-amount { font-size: 32px; font-weight: 800; color: #780016; margin: 6px 0; }
          .price-desc { font-size: 13px; color: #666; }
          .section-title { font-size: 15px; font-weight: bold; color: #780016; border-bottom: 2px solid #f0f0f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 14px; }
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table td { padding: 8px 4px; font-size: 14px; vertical-align: top; }
          .label { color: #666666; font-weight: 600; width: 38%; }
          .value { color: #111111; font-weight: 500; }
          .btn-wa { display: inline-block; background: #25D366; color: white !important; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; text-align: center; margin: 15px 0 5px 0; }
          .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 ¡NUEVO PEDIDO RECIBIDO!</h1>
            <p>Jamón de Cebo de Campo 75% Ibérico de Guijuelo</p>
            <span class="badge">PAGO A CONTRARREMBOLSO</span>
          </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>

          <div class="content">
            <div class="price-box">
              <div class="price-title">Importe a Cobrar al Entregar</div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
              <div class="price-amount">${totalPagar}</div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
              <div class="price-desc">${packNombre} (Envío Gratis 24/72h)</div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
            </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>

            <div class="section-title">📦 DETALLES DEL PEDIDO (#${orderRef})</div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
            <table class="data-table">
              <tr>
                <td class="label">Producto:</td>
                <td class="value">Jamón Cebo de Campo 75% Ibérico (Guijuelo)</td>
              </tr>
              <tr>
                <td class="label">Selección:</td>
                <td class="value"><strong>${packNombre}</strong></td>
              </tr>
              <tr>
                <td class="label">Cantidad:</td>
                <td class="value">${numSobres}</td>
              </tr>
              <tr>
                <td class="label">Método de Pago:</td>
                <td class="value"><span style="color:#b91c1c; font-weight:bold;">Contrarrembolso</span> (El cliente paga al recibirlo)</td>
              </tr>
              <tr>
                <td class="label">Fecha y Hora:</td>
                <td class="value">${fecha}</td>
              </tr>
            </table>

            <div class="section-title">👤 DATOS DE ENVÍO Y CONTACTO</div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
            <table class="data-table">
              <tr>
                <td class="label">Nombre Completo:</td>
                <td class="value"><strong>${nombre}</strong></td>
              </tr>
              <tr>
                <td class="label">Teléfono:</td>
                <td class="value">
                  <a href="tel:${telefono}" style="color:#0284c7; text-decoration:none; font-weight:bold; font-size:16px;">${telefono}</a>
                </td>
              </tr>
              <tr>
                <td class="label">Calle y Número:</td>
                <td class="value"><strong>${calle}</strong></td>
              </tr>
              <tr>
                <td class="label">Ciudad / Poblado:</td>
                <td class="value">${ciudad}</td>
              </tr>
              <tr>
                <td class="label">Provincia:</td>
                <td class="value"><strong>${provincia}</strong></td>
              </tr>
              <tr>
                <td class="label">Código Postal:</td>
                <td class="value"><strong>${codigoPostal}</strong></td>
              </tr>
              ${notas ? `
              <tr>
                <td class="label">Notas / Indicaciones:</td>
                <td class="value" style="background:#fef3c7; padding:8px; border-radius:6px; color:#92400e;">${notas}</td>
              </tr>
              ` : ''}
            </table>

            <div style="text-align: center; margin-top: 20px;">
              <a href="${whatsappLink}" target="_blank" class="btn-wa">
                📲 Abrir WhatsApp con el Cliente para Confirmar Envío
              </a>
            </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
          </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>

          <div class="footer">
            <p style="margin: 0;">Pedido generado desde tu tienda online de Jamón de Guijuelo.</p>
            <p style="margin: 4px 0 0 0;">Recuerda etiquetar el paquete con cobro a contrarrembolso de <strong>${totalPagar}</strong> (WhatsApp de la tienda: 614 070 656).</p>
          </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
        </div>
         <img src="/images/jamon-hero.jpg" alt="Jamón de Guijuelo" style="max-width:100%; height:auto; margin:20px 0;"/>
      </body>
      </html>
    `;

    // 1. Intentar enviar mediante Resend API (Recomendado oficial para Vercel)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'badreddinnakhil@gmail.com';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    let emailSent = false;
    let providerUsed = 'none';
    let emailDetails = null;

    if (RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [NOTIFICATION_EMAIL],
            subject: `🚨 ¡NUEVO PEDIDO #${orderRef}! - ${totalPagar} - ${nombre} (${ciudad})`,
            html: emailHtml
          })
        });

        const resendData = await resendResponse.json();
        if (resendResponse.ok) {
          emailSent = true;
          providerUsed = 'resend';
          emailDetails = resendData;
        } else {
          console.error('Error al enviar con Resend API:', resendData);
        }
      } catch (err) {
        console.error('Excepción al conectar con Resend:', err);
      }
    }

    // 2. Fallback opcional si se usa Web3Forms
    const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
    if (!emailSent && WEB3FORMS_KEY) {
      try {
        const w3fRes = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `🚨 ¡NUEVO PEDIDO #${orderRef}! - ${totalPagar} - ${nombre}`,
            from_name: 'Tienda Jamón Guijuelo',
            to: NOTIFICATION_EMAIL,
            nombre,
            telefono,
            calle,
            ciudad,
            provincia,
            codigoPostal,
            pack: packNombre,
            total: totalPagar,
            notas: notas || 'Sin notas adicionales',
            referencia: orderRef
          })
        });
        if (w3fRes.ok) {
          emailSent = true;
          providerUsed = 'web3forms';
        }
      } catch (err) {
        console.error('Excepción con Web3Forms:', err);
      }
    }

    // Registrar en consola de Vercel (siempre visible en Vercel Logs para nunca perder un pedido)
    console.log('=== 🥓 NUEVO PEDIDO REGISTRADO ===', {
      orderRef,
      fecha,
      cliente: { nombre, telefono, calle, ciudad, provincia, codigoPostal },
      pack: packNombre,
      total: totalPagar,
      notas,
      emailSent,
      providerUsed
    });

    // Responder con éxito al frontend
    return res.status(200).json({
      success: true,
      message: 'Pedido recibido correctamente.',
      orderId: orderRef,
      total: totalPagar,
      pack: packNombre,
      emailSent,
      providerUsed,
      warning: !emailSent ? 'Configura RESEND_API_KEY y NOTIFICATION_EMAIL en Vercel para recibir el correo en tu Gmail.' : undefined
    });

  } catch (error) {
    console.error('Error en procesador de pedidos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar el pedido. Inténtelo de nuevo o contáctenos por teléfono.'
    });
  }
}
