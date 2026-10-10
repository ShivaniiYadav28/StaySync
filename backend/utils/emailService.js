const nodemailer = require("nodemailer");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const maskEmail = (email) => {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "(invalid email)";
  return `${name.slice(0, 2)}***@${domain}`;
};

const sendBookingConfirmation = async ({
  booking,
  property,
  seeker,
  owner,
}) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error("SMTP email settings are missing from the backend environment.");
  }

  if (!seeker?.email || !owner?.email) {
    throw new Error("The seeker or property owner does not have an email address.");
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE === "true" || port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const moveInDate = new Date(booking.moveInDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const location = [property?.address, property?.city]
    .filter(Boolean)
    .join(", ");

  const propertyTitle = property?.title || "StaySync property";
  const tokenAmount = booking?.tokenAmount ?? "N/A";
  const paymentId = booking?.razorpayPaymentId || "N/A";
  const bookingId = booking?._id || "N/A";

  const text = [
    "Your StaySync booking is confirmed.",
    "",
    `Property: ${propertyTitle}`,
    `Location: ${location || "N/A"}`,
    `Move-in date: ${moveInDate}`,
    `Token paid: INR ${tokenAmount}`,
    `Payment ID: ${paymentId}`,
    `Booking ID: ${bookingId}`,
  ].join("\n");

  const html =
    '<div style="font-family:Arial,sans-serif;color:#172033;max-width:600px;margin:auto;padding:24px">' +
    '<h1 style="color:#0f766e">Booking confirmed</h1>' +
    "<p>Your StaySync PG booking is confirmed.</p>" +
    '<table style="width:100%;border-collapse:collapse">' +
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">Property</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(propertyTitle)}</td></tr>` +
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">Location</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(location || "N/A")}</td></tr>` +
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">Move-in date</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(moveInDate)}</td></tr>` +
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">Token paid</td><td style="padding:8px;border-bottom:1px solid #ddd">INR ${escapeHtml(tokenAmount)}</td></tr>` +
    `<tr><td style="padding:8px;border-bottom:1px solid #ddd">Payment ID</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(paymentId)}</td></tr>` +
    `<tr><td style="padding:8px">Booking ID</td><td style="padding:8px">${escapeHtml(bookingId)}</td></tr>` +
    "</table>" +
    '<p style="color:#64748b;font-size:13px;margin-top:24px">This confirmation was sent to the seeker and property owner.</p>' +
    "</div>";

  const recipients = [
    ...new Set([seeker.email.trim(), owner.email.trim()].filter(Boolean)),
  ];

  console.log("Attempting to send StaySync booking confirmations.");
  console.log("Configured SMTP host:", SMTP_HOST);
  console.log("Configured SMTP port:", port);
  console.log("Configured sender:", maskEmail(MAIL_FROM));

  await transporter.verify();
  console.log("SMTP connection verified successfully.");

  const results = [];

  for (const recipient of recipients) {
    try {
      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to: recipient,
        subject: "StaySync PG booking confirmed",
        text,
        html,
      });

      const result = {
        recipient: maskEmail(recipient),
        accepted: info.accepted || [],
        rejected: info.rejected || [],
        response: info.response || null,
        messageId: info.messageId || null,
        error: null,
      };

      console.log("Booking email SMTP result:", result);
      results.push(result);
    } catch (error) {
      const result = {
        recipient: maskEmail(recipient),
        accepted: [],
        rejected: [recipient],
        response: null,
        messageId: null,
        error: error.message,
      };

      console.error("Booking email send failed:", result);
      results.push(result);
    }
  }

  const allAccepted = results.length === recipients.length && results.every((result) => result.accepted.length > 0 && result.rejected.length === 0 && !result.error);

  return { results, allAccepted };
};

module.exports = { sendBookingConfirmation };