// api/contact.js — Vercel Serverless Function
//
// Receives the portfolio contact form and delivers the message straight to the
// site owner's inbox using Resend's REST API (https://resend.com).
//
// Security model:
//   • The API key lives ONLY in process.env.RESEND_API_KEY (server-side).
//     It is never shipped to, or referenced by, the frontend.
//   • All fields are validated and length-capped on the server.
//   • User input is HTML-escaped before being placed in the email body.
//   • A honeypot field + a best-effort rate limit reduce spam/abuse.
//
// No npm dependencies: uses the global `fetch` available on Vercel's Node 18+ runtime.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort in-memory rate limit (per warm serverless instance).
// Not a hard guarantee across instances, but a cheap first line of defence.
const RATE = { windowMs: 60 * 1000, max: 5, hits: new Map() };

function rateLimited(ip) {
    const now = Date.now();
    const rec = RATE.hits.get(ip) || { count: 0, start: now };
    if (now - rec.start > RATE.windowMs) {
        rec.count = 0;
        rec.start = now;
    }
    rec.count += 1;
    RATE.hits.set(ip, rec);
    return rec.count > RATE.max;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function readBody(req) {
    // Vercel usually parses JSON bodies into req.body; handle every shape safely.
    if (req.body) {
        if (typeof req.body === "object") return Promise.resolve(req.body);
        if (typeof req.body === "string") {
            try { return Promise.resolve(JSON.parse(req.body)); }
            catch (e) { return Promise.resolve({}); }
        }
    }
    return new Promise(function (resolve) {
        let raw = "";
        req.on("data", function (c) {
            raw += c;
            if (raw.length > 1e6) req.destroy(); // ~1MB guard
        });
        req.on("end", function () {
            try { resolve(JSON.parse(raw || "{}")); }
            catch (e) { resolve({}); }
        });
        req.on("error", function () { resolve({}); });
    });
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Method not allowed." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("RESEND_API_KEY is not configured");
        return res.status(500).json({ success: false, error: "Email service is not configured." });
    }

    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    if (rateLimited(ip)) {
        return res.status(429).json({ success: false, error: "Too many messages — please try again in a minute." });
    }

    const body = await readBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const honey = String(body.website || "").trim(); // honeypot

    // Bot filled the hidden field → pretend success, send nothing.
    if (honey) return res.status(200).json({ success: true });

    // Server-side validation (never trust the client)
    if (
        !name || name.length > 100 ||
        !EMAIL_RE.test(email) || email.length > 150 ||
        !subject || subject.length > 150 ||
        message.length < 10 || message.length > 5000
    ) {
        return res.status(422).json({ success: false, error: "Please complete all fields correctly." });
    }

    const TO = process.env.CONTACT_TO || "danieloluwasegun488@gmail.com";
    const FROM = process.env.CONTACT_FROM || "Portfolio Contact <onboarding@resend.dev>";

    const html =
        '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2A1E14;line-height:1.6">' +
        '<h2 style="color:#8B4513;margin:0 0 16px">New message from your portfolio</h2>' +
        '<p style="margin:0 0 6px"><strong>Name:</strong> ' + escapeHtml(name) + '</p>' +
        '<p style="margin:0 0 6px"><strong>Email:</strong> ' + escapeHtml(email) + '</p>' +
        '<p style="margin:0 0 6px"><strong>Subject:</strong> ' + escapeHtml(subject) + '</p>' +
        '<p style="margin:16px 0 6px"><strong>Message:</strong></p>' +
        '<p style="white-space:pre-wrap;border-left:3px solid #8B4513;padding:4px 0 4px 14px;margin:0">' +
        escapeHtml(message) + '</p>' +
        '</div>';

    const text =
        "New message from your portfolio\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Subject: " + subject + "\n\n" +
        message;

    try {
        const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: FROM,
                to: [TO],
                reply_to: email,            // reply goes straight to the visitor
                subject: "[Portfolio] " + subject,
                html: html,
                text: text
            })
        });

        if (!resp.ok) {
            const detail = await resp.text().catch(function () { return ""; });
            console.error("Resend API error:", resp.status, detail);
            return res.status(502).json({ success: false, error: "Couldn't send your message right now. Please try again later." });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Contact function error:", err);
        return res.status(500).json({ success: false, error: "Unexpected error sending your message." });
    }
};
