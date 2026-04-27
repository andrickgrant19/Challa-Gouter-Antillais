"""Resend transactional email helpers for Chala Le Gouter Antillais.

All functions are fail-soft: any exception is caught and logged so that
email failures NEVER break the order/catering submission flow.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "Chala Le Goûter Antillais <noreply@chalalegouterantillais.ca>")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "")
DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "https://chalalegouterantillais.ca/dashboard")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


# ─── Brand & shared layout ───────────────────────────────────────────────────

BRAND_ORANGE = "#E07B39"
BRAND_BLACK = "#111111"
BRAND_GOLD = "#D4AF37"
BRAND_CREAM = "#FAF8F5"

RESTAURANT_NAME = "Chala Le Goûter Antillais"
RESTAURANT_ADDRESS = "11866 Boulevard De La Rivière-Des-Prairies, Montréal, QC H1C 1P9"
RESTAURANT_PHONE = "(514) 588-3708"


def _shell(title: str, body_html: str, footer_note: str = "") -> str:
    """Wrap content in a mobile-friendly table layout (inline CSS only)."""
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{BRAND_CREAM};font-family:Arial,Helvetica,sans-serif;color:{BRAND_BLACK};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:{BRAND_CREAM};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06);">
      <tr><td style="background:{BRAND_BLACK};padding:24px 28px;text-align:center;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">Chala</div>
        <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:{BRAND_GOLD};margin-top:4px;">Le Goûter Antillais</div>
      </td></tr>
      <tr><td style="padding:28px;">{body_html}</td></tr>
      <tr><td style="background:{BRAND_CREAM};padding:18px 28px;border-top:1px solid #eee;font-size:12px;color:#666;line-height:1.6;">
        <strong style="color:{BRAND_BLACK};">{RESTAURANT_NAME}</strong><br>
        {RESTAURANT_ADDRESS}<br>
        <a href="tel:+15145883708" style="color:{BRAND_ORANGE};text-decoration:none;">{RESTAURANT_PHONE}</a>
        {f'<div style="margin-top:10px;color:#888;font-size:11px;">{footer_note}</div>' if footer_note else ''}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


def _items_table(items: List[Dict[str, Any]], lang: str = "fr") -> str:
    qty_label = "Qté" if lang == "fr" else "Qty"
    item_label = "Article" if lang == "fr" else "Item"
    price_label = "Prix" if lang == "fr" else "Price"
    rows = []
    for it in items:
        name = str(it.get("name", "")).replace("<", "&lt;")
        qty = int(it.get("quantity", 1))
        unit = float(it.get("unit_price", 0))
        line = unit * qty
        rows.append(
            f'<tr>'
            f'<td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;">{name}</td>'
            f'<td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:center;color:#666;">{qty}</td>'
            f'<td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">${line:.2f}</td>'
            f'</tr>'
        )
    head = (
        f'<tr style="background:{BRAND_CREAM};">'
        f'<th align="left" style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">{item_label}</th>'
        f'<th style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">{qty_label}</th>'
        f'<th align="right" style="padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666;">{price_label}</th>'
        f'</tr>'
    )
    return f'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;margin:8px 0 16px;">{head}{"".join(rows)}</table>'


# ─── Public senders ──────────────────────────────────────────────────────────

async def _send(params: Dict[str, Any]) -> Optional[str]:
    """Internal: send via Resend in a thread, swallow all errors, return id or None."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email %r", params.get("subject"))
        return None
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        eid = result.get("id") if isinstance(result, dict) else None
        logger.info("Resend email sent id=%s to=%s subject=%r", eid, params.get("to"), params.get("subject"))
        return eid
    except Exception as e:
        logger.error("Resend email FAILED to=%s subject=%r err=%s", params.get("to"), params.get("subject"), e)
        return None


async def send_customer_order_confirmation(order: Dict[str, Any], lang: str = "fr") -> Optional[str]:
    """Email the customer their order receipt. Fail-soft."""
    to_email = (order.get("customer_email") or "").strip()
    if not to_email:
        return None
    is_fr = lang == "fr"
    order_id = str(order.get("id", ""))
    short_id = order_id[:8].upper() if order_id else "—"
    name = order.get("customer_name") or ""
    order_type = order.get("order_type", "pickup")
    subtotal = float(order.get("subtotal", 0))
    items = order.get("items") or []
    address = order.get("delivery_address") or ""
    notes = order.get("notes") or ""

    type_label = (
        ("À emporter" if is_fr else "Pickup") if order_type == "pickup"
        else ("Livraison" if is_fr else "Delivery")
    )
    eta = (
        ("Votre commande sera prête en 20-30 minutes" if is_fr else "Your order will be ready in 20-30 minutes")
        if order_type == "pickup"
        else ("Votre commande sera livrée en 40-55 minutes" if is_fr else "Your order will be delivered in 40-55 minutes")
    )

    if is_fr:
        subject = f"Confirmation de commande #{short_id} - {RESTAURANT_NAME}"
        thank_you = "Merci pour votre commande !"
        intro = f"Bonjour {name}, votre commande a bien été reçue. Voici le récapitulatif :"
        order_n = "Numéro de commande"
        type_h = "Type de commande"
        addr_h = "Adresse de livraison"
        notes_h = "Notes"
        total_h = "Total"
        eta_h = "Délai estimé"
        footer_note = "Cet email a été envoyé automatiquement. Pour toute question, contactez-nous au (514) 588-3708."
    else:
        subject = f"Order Confirmation #{short_id} - {RESTAURANT_NAME}"
        thank_you = "Thank you for your order!"
        intro = f"Hi {name}, we’ve received your order. Here is your receipt:"
        order_n = "Order number"
        type_h = "Order type"
        addr_h = "Delivery address"
        notes_h = "Notes"
        total_h = "Total"
        eta_h = "Estimated time"
        footer_note = "This is an automated email. For any question, call us at (514) 588-3708."

    address_block = f'<p style="margin:8px 0;"><strong style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">{addr_h}:</strong><br>{address}</p>' if order_type == "delivery" and address else ""
    notes_block = f'<p style="margin:8px 0;"><strong style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">{notes_h}:</strong><br>{notes}</p>' if notes else ""

    body = f"""
<h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:{BRAND_BLACK};">{thank_you}</h1>
<p style="margin:0 0 18px;color:#444;line-height:1.6;font-size:15px;">{intro}</p>

<div style="background:{BRAND_CREAM};border-radius:10px;padding:14px 18px;margin:14px 0;">
  <p style="margin:0;font-size:13px;color:#666;">{order_n}</p>
  <p style="margin:2px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:{BRAND_ORANGE};">#{short_id}</p>
</div>

<p style="margin:14px 0 6px;"><strong style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">{type_h}:</strong> {type_label}</p>
{address_block}
{notes_block}

{_items_table(items, lang)}

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="padding:14px 0;border-top:2px solid {BRAND_BLACK};">
      <span style="font-size:14px;color:#666;text-transform:uppercase;letter-spacing:1px;">{total_h}</span>
    </td>
    <td align="right" style="padding:14px 0;border-top:2px solid {BRAND_BLACK};">
      <span style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:{BRAND_ORANGE};">${subtotal:.2f} CAD</span>
    </td>
  </tr>
</table>

<div style="margin-top:18px;background:#fff7ed;border-left:3px solid {BRAND_ORANGE};padding:12px 14px;border-radius:6px;">
  <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">{eta_h}</p>
  <p style="margin:4px 0 0;font-size:15px;color:{BRAND_BLACK};font-weight:600;">{eta}</p>
</div>
"""
    return await _send({
        "from": EMAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "html": _shell(subject, body, footer_note),
    })


async def send_owner_order_notification(order: Dict[str, Any]) -> Optional[str]:
    """Notify the owner of a new order. Fail-soft."""
    if not OWNER_EMAIL:
        logger.warning("OWNER_EMAIL not set — skipping owner order notification")
        return None
    order_id = str(order.get("id", ""))
    short_id = order_id[:8].upper() if order_id else "—"
    subtotal = float(order.get("subtotal", 0))
    name = order.get("customer_name") or "—"
    email = order.get("customer_email") or "—"
    phone = order.get("customer_phone") or "—"
    order_type = order.get("order_type", "pickup")
    address = order.get("delivery_address") or ""
    notes = order.get("notes") or ""
    items = order.get("items") or []
    created = order.get("created_at") or ""

    type_label = "Livraison" if order_type == "delivery" else "À emporter"
    subject = f"🍽️ Nouvelle commande #{short_id} - ${subtotal:.2f}"
    addr = f'<p style="margin:6px 0;"><strong>Adresse :</strong> {address}</p>' if order_type == "delivery" and address else ""
    notes_html = f'<div style="margin-top:10px;background:#fffbeb;border-left:3px solid {BRAND_GOLD};padding:10px 12px;border-radius:6px;"><strong style="color:#92400e;">Notes :</strong><br>{notes}</div>' if notes else ""

    body = f"""
<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:{BRAND_BLACK};">Nouvelle commande</h1>
<p style="margin:0 0 18px;color:#666;font-size:13px;">Reçue le {created or "—"}</p>

<div style="background:{BRAND_CREAM};border-radius:10px;padding:14px 18px;margin-bottom:18px;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="font-size:13px;color:#666;">N° commande</td>
      <td align="right"><strong style="font-family:Georgia,serif;color:{BRAND_ORANGE};font-size:18px;">#{short_id}</strong></td>
    </tr>
    <tr><td style="font-size:13px;color:#666;padding-top:6px;">Type</td><td align="right" style="padding-top:6px;"><strong>{type_label}</strong></td></tr>
    <tr><td style="font-size:13px;color:#666;padding-top:6px;">Total</td><td align="right" style="padding-top:6px;"><strong style="color:{BRAND_ORANGE};font-size:20px;font-family:Georgia,serif;">${subtotal:.2f}</strong></td></tr>
  </table>
</div>

<h3 style="margin:18px 0 6px;font-family:Georgia,serif;color:{BRAND_BLACK};">Client</h3>
<p style="margin:6px 0;"><strong>{name}</strong></p>
<p style="margin:6px 0;font-size:14px;color:#444;">📧 <a href="mailto:{email}" style="color:{BRAND_ORANGE};">{email}</a></p>
<p style="margin:6px 0;font-size:14px;color:#444;">📞 <a href="tel:{phone}" style="color:{BRAND_ORANGE};">{phone}</a></p>
{addr}

<h3 style="margin:22px 0 6px;font-family:Georgia,serif;color:{BRAND_BLACK};">Articles</h3>
{_items_table(items, "fr")}
{notes_html}

<div style="text-align:center;margin-top:22px;">
  <a href="{DASHBOARD_URL}" style="display:inline-block;background:{BRAND_ORANGE};color:#ffffff;font-weight:600;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;">Ouvrir le tableau de bord →</a>
</div>
"""
    return await _send({
        "from": EMAIL_FROM,
        "to": [OWNER_EMAIL],
        "subject": subject,
        "html": _shell(subject, body, "Notification automatique — Tableau de bord propriétaire"),
    })


async def send_owner_catering_notification(req: Dict[str, Any]) -> Optional[str]:
    """Notify the owner of a new catering request. Fail-soft."""
    if not OWNER_EMAIL:
        logger.warning("OWNER_EMAIL not set — skipping catering notification")
        return None
    name = req.get("name") or "—"
    email = req.get("email") or "—"
    phone = req.get("phone") or "—"
    event_type = req.get("event_type") or "—"
    event_date = req.get("event_date") or "—"
    guest_count = req.get("guest_count") or "—"
    message = req.get("message") or ""
    catering_url = f"{DASHBOARD_URL}/catering"

    subject = f"📅 Nouvelle demande traiteur - {event_type} - {name}"
    msg_block = f'<div style="margin-top:10px;background:{BRAND_CREAM};padding:12px 14px;border-radius:8px;font-size:14px;line-height:1.6;color:#333;"><strong style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Message :</strong><br>{message}</div>' if message else ""

    body = f"""
<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:{BRAND_BLACK};">Nouvelle demande traiteur</h1>
<p style="margin:0 0 18px;color:#666;font-size:13px;">Un client souhaite un service traiteur.</p>

<table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;width:140px;color:#666;font-size:13px;">Client</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;">{name}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;border-bottom:1px solid #eee;"><a href="mailto:{email}" style="color:{BRAND_ORANGE};text-decoration:none;">{email}</a></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;">Téléphone</td><td style="padding:8px 0;border-bottom:1px solid #eee;"><a href="tel:{phone}" style="color:{BRAND_ORANGE};text-decoration:none;">{phone}</a></td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;">Type d’événement</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;">{event_type}</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee;">{event_date}</td></tr>
  <tr><td style="padding:8px 0;color:#666;font-size:13px;">Nombre d’invités</td><td style="padding:8px 0;font-weight:600;">{guest_count}</td></tr>
</table>
{msg_block}

<div style="text-align:center;margin-top:22px;">
  <a href="{catering_url}" style="display:inline-block;background:{BRAND_ORANGE};color:#ffffff;font-weight:600;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;">Voir dans le tableau de bord →</a>
</div>
"""
    return await _send({
        "from": EMAIL_FROM,
        "to": [OWNER_EMAIL],
        "subject": subject,
        "html": _shell(subject, body, "Notification automatique — demandes traiteur"),
    })
