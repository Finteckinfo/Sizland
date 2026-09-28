import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { PACKAGE_INTEREST_OPTIONS } from "@/lib/solutions/pricing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const name = asString(req.body?.name, 120);
  const email = asString(req.body?.email, 180);
  const phone = asString(req.body?.phone, 40);
  const preferredAt = asString(req.body?.preferredAt, 80);
  const interest = asString(req.body?.interest, 40);
  const notes = asString(req.body?.notes, 2000);

  if (!name || !email || !phone || !preferredAt) {
    return res.status(400).json({ error: "Name, email, phone, and preferred time are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const interestLabel =
    PACKAGE_INTEREST_OPTIONS.find((option) => option.value === interest)?.label ||
    interest ||
    "Not specified";

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const to = process.env.SOLUTIONS_INQUIRY_EMAIL || user;

  if (!user || !pass || !to) {
    console.error("Appointment mailer missing EMAIL_USER / EMAIL_PASSWORD");
    return res.status(500).json({ error: "Booking is temporarily unavailable. Use WhatsApp instead." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      replyTo: email,
      subject: `Solutions appointment: ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Preferred time: ${preferredAt}`,
        `Package interest: ${interestLabel}`,
        "",
        notes || "(no notes)",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#14201a">
          <h2 style="color:#059669">New solutions appointment request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Preferred time:</strong> ${escapeHtml(preferredAt)}</p>
          <p><strong>Package:</strong> ${escapeHtml(interestLabel)}</p>
          <p><strong>Notes:</strong></p>
          <p style="white-space:pre-wrap;background:#f4f7f5;padding:16px;border-radius:8px">${escapeHtml(notes || "(none)")}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Appointment email failed:", error);
    return res.status(500).json({ error: "Could not send the request. Try WhatsApp." });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
