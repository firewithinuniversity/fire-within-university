import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { getStripeWebhookSecret, getResendApiKey, getContactFormEmail } from "@/lib/env";
import { EMAIL_FROM_NOREPLY } from "@/lib/constants";
import { escapeHtml } from "@/lib/escapeHtml";

const MAX_BODY_SIZE = 64 * 1024; // 64KB — webhook payloads are moderate JSON

export async function POST(request: Request) {
  const contentLength = parseInt(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ message: "Request too large." }, { status: 413 });
  }

  let rawBodyBuffer: Buffer;
  try {
    rawBodyBuffer = Buffer.from(await request.arrayBuffer());
  } catch {
    return NextResponse.json({ message: "Could not read request body." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json(
      { message: "Missing signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBodyBuffer,
      signature,
      getStripeWebhookSecret()
    );
  } catch {
    console.error("[Stripe Webhook] Signature verification failed");
    return NextResponse.json(
      { message: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email;
        const name = session.customer_details?.name ?? "Someone";
        // Donor name/email come from user-controlled Checkout fields — escape
        // before interpolating into HTML email bodies.
        const safeName = escapeHtml(name);
        const safeEmail = email ? escapeHtml(email) : null;
        const amountTotal = session.amount_total ?? 0;
        const dollars = (amountTotal / 100).toFixed(2);
        const frequency = session.metadata?.frequency ?? "once";
        const isMonthly = frequency === "monthly";

        console.log(
          `[Stripe Webhook] Donation received: $${dollars} (${frequency}) from ${email ?? "unknown"}`
        );

        // Send thank-you email to donor
        if (email) {
          try {
            const resend = new Resend(getResendApiKey());
            await resend.emails.send({
              from: `Fire Within University <${EMAIL_FROM_NOREPLY}>`,
              to: email,
              subject: isMonthly
                ? "Thank you for your monthly support!"
                : "Thank you for your generous donation!",
              text: `Thank you, ${name}!\n\nYour ${isMonthly ? "monthly" : "one-time"} donation of $${dollars} to Fire Within University has been received. Your generosity fuels this ministry.\n\n"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7\n\nWith gratitude,\nBrett & Jude\nFire Within University`,
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 16px;">
                  <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
                    Thank you, ${safeName}!
                  </h1>
                  <p style="font-size: 16px; color: #444; line-height: 1.6;">
                    Your ${isMonthly ? "monthly" : "one-time"} donation of <strong>$${dollars}</strong> to
                    Fire Within University has been received. Your generosity fuels this ministry and helps
                    us continue sharing God's Word.
                  </p>
                  ${isMonthly ? `
                  <p style="font-size: 14px; color: #666; line-height: 1.6;">
                    Your card will be charged $${dollars} each month. You can manage or cancel your
                    subscription anytime through the link in your Stripe receipt.
                  </p>
                  ` : ""}
                  <p style="font-size: 16px; color: #444; line-height: 1.6;">
                    &ldquo;Each of you should give what you have decided in your heart to give, not
                    reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
                    <br><em style="color: #888;">&mdash; 2 Corinthians 9:7</em>
                  </p>
                  <p style="font-size: 14px; color: #888; margin-top: 24px;">
                    With gratitude,<br>
                    Brett &amp; Jude<br>
                    Fire Within University
                  </p>
                </div>
              `,
            });
          } catch (emailErr) {
            // Don't fail the webhook if the email fails
            console.error(
              "[Stripe Webhook] Failed to send thank-you email:",
              emailErr instanceof Error ? emailErr.message : "Unknown error"
            );
          }
        }

        // Notify the team
        try {
          const resend = new Resend(getResendApiKey());
          await resend.emails.send({
            from: `Fire Within University <${EMAIL_FROM_NOREPLY}>`,
            to: getContactFormEmail(),
            subject: `New donation: $${dollars} (${frequency})`,
            html: `
              <div style="font-family: system-ui, sans-serif; padding: 16px;">
                <h2 style="color: #1a1a1a;">New Donation Received</h2>
                <table style="font-size: 14px; color: #444; border-collapse: collapse;">
                  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Amount:</td><td>$${dollars}</td></tr>
                  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Frequency:</td><td>${isMonthly ? "Monthly" : "One-time"}</td></tr>
                  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Donor:</td><td>${safeName}</td></tr>
                  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Email:</td><td>${safeEmail ?? "Not provided"}</td></tr>
                  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Session ID:</td><td style="font-size: 12px; color: #888;">${session.id}</td></tr>
                </table>
              </div>
            `,
          });
        } catch (notifyErr) {
          console.error(
            "[Stripe Webhook] Failed to send team notification:",
            notifyErr instanceof Error ? notifyErr.message : "Unknown error"
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Subscription cancelled: ${sub.id}`);
        try {
          const resend = new Resend(getResendApiKey());
          await resend.emails.send({
            from: `Fire Within University <${EMAIL_FROM_NOREPLY}>`,
            to: getContactFormEmail(),
            subject: `Monthly donation cancelled`,
            html: `
              <div style="font-family: system-ui, sans-serif; padding: 16px;">
                <h2 style="color: #1a1a1a;">A Recurring Donation Was Cancelled</h2>
                <p style="font-size: 14px; color: #444;">A monthly supporter's subscription has ended. Consider a follow-up.</p>
                <p style="font-size: 12px; color: #888;">Subscription ID: ${sub.id}<br/>Customer ID: ${String(sub.customer)}</p>
              </div>
            `,
          });
        } catch (notifyErr) {
          console.error(
            "[Stripe Webhook] Failed to send cancellation notice:",
            notifyErr instanceof Error ? notifyErr.message : "Unknown error"
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Payment failed for invoice ${invoice.id}`);
        try {
          const amountDue = ((invoice.amount_due ?? 0) / 100).toFixed(2);
          const resend = new Resend(getResendApiKey());
          await resend.emails.send({
            from: `Fire Within University <${EMAIL_FROM_NOREPLY}>`,
            to: getContactFormEmail(),
            subject: `Recurring donation payment failed`,
            html: `
              <div style="font-family: system-ui, sans-serif; padding: 16px;">
                <h2 style="color: #1a1a1a;">A Recurring Payment Failed</h2>
                <p style="font-size: 14px; color: #444;">A monthly donor's payment did not go through (often an expired card).</p>
                <p style="font-size: 12px; color: #888;">Invoice ID: ${invoice.id}<br/>Amount due: $${amountDue}<br/>Donor email: ${invoice.customer_email ?? "Not provided"}</p>
              </div>
            `,
          });
        } catch (notifyErr) {
          console.error(
            "[Stripe Webhook] Failed to send payment-failed notice:",
            notifyErr instanceof Error ? notifyErr.message : "Unknown error"
          );
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      "[Stripe Webhook] Error processing event:",
      error instanceof Error ? error.message : "Unknown error"
    );
    // Return 200 so Stripe doesn't retry an event we already received
    return NextResponse.json({ received: true });
  }
}
