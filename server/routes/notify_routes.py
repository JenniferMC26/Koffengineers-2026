"""
routes/notify_routes.py — Email notifications via Gmail SMTP
POST /api/notify/receipt  — send order receipt to admin + customer CC
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, jsonify, request

bp = Blueprint("notify", __name__, url_prefix="/api/notify")

GMAIL_USER     = os.getenv("GMAIL_USER", "")
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")


@bp.post("/receipt")
def send_receipt():
    if not GMAIL_USER or not GMAIL_PASSWORD:
        # Credentials not configured — fail silently from the client's perspective
        return jsonify({"error": "Email service not configured"}), 503

    data = request.get_json(silent=True) or {}

    order_id        = data.get("order_id", "?")
    customer_name   = data.get("customer_name", "")
    customer_email  = data.get("customer_email", "")
    items           = data.get("items", [])
    subtotal        = float(data.get("subtotal", 0))
    shipping_cost   = float(data.get("shipping_cost", 0))
    total           = float(data.get("total", 0))
    shipping_method = data.get("shipping_method", "")
    eta             = data.get("eta", "")
    address         = data.get("address", "")
    payment_method  = data.get("payment_method", "")

    items_rows = "".join(
        f"<tr><td style='padding:6px 8px'>{i.get('name','?')} &times;{i.get('qty',1)}</td>"
        f"<td style='padding:6px 8px;text-align:right'>"
        f"${float(i.get('price',0)) * int(i.get('qty',1)):,.2f}</td></tr>"
        for i in items
    )
    payment_row = (
        f"<p style='margin:4px 0'><strong>Método de pago:</strong> {payment_method}</p>"
        if payment_method else ""
    )

    html = f"""
    <html><body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1917;max-width:520px;margin:0 auto">
      <h2 style="font-weight:400;border-bottom:1px solid #e5e3de;padding-bottom:12px">
        Pedido #{order_id} — CLYRO
      </h2>
      <p style="margin:4px 0"><strong>Cliente:</strong> {customer_name}</p>
      <p style="margin:4px 0"><strong>Correo:</strong> {customer_email}</p>
      <p style="margin:4px 0"><strong>Dirección:</strong> {address}</p>
      {payment_row}

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f4f2ed">
            <th style="padding:8px;text-align:left;font-weight:500">Producto</th>
            <th style="padding:8px;text-align:right;font-weight:500">Importe</th>
          </tr>
        </thead>
        <tbody>{items_rows}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse">
        <tr><td>Subtotal</td><td style="text-align:right">${subtotal:,.2f}</td></tr>
        <tr><td>Envío ({shipping_method})</td><td style="text-align:right">${shipping_cost:,.2f}</td></tr>
        <tr style="font-size:18px;font-weight:300;border-top:1px solid #e5e3de">
          <td style="padding-top:10px">Total</td>
          <td style="text-align:right;padding-top:10px">${total:,.2f}</td>
        </tr>
      </table>

      <p style="margin-top:20px;color:#6b6968;font-size:13px">
        Tiempo estimado de entrega: {eta}
      </p>
    </body></html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Nuevo pedido #{order_id} — CLYRO"
        msg["From"]    = GMAIL_USER
        msg["To"]      = GMAIL_USER

        recipients = [GMAIL_USER]
        if customer_email and customer_email != GMAIL_USER:
            msg["Cc"] = customer_email
            recipients.append(customer_email)

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(GMAIL_USER, GMAIL_PASSWORD)
            smtp.sendmail(GMAIL_USER, recipients, msg.as_string())

        return jsonify({"message": "Email enviado"}), 200

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
