import type { OnboardingDocument } from '@/types/campaign.types';

// ── Design tokens (literal values — no CSS vars so PDF/email renders intact) ──
const GRAD_START = '#1e1b4b';
const GRAD_MID = '#3730a3';
const GRAD_END = '#6c63ff';
const BORDER = '#e8e8f0';
const BG_SECTION = '#f9f9fb';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#374151';
const TEXT_TERTIARY = '#6b7280';
const PILL_BG = '#f3f2ff';
const PILL_TEXT = '#5b21b6';

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '')
    return `<span style="color:${TEXT_TERTIARY};font-style:italic;">—</span>`;
  return `<span style="font-size:14px;color:${TEXT_PRIMARY};line-height:1.5;font-family:'Inter',sans-serif;">${v}</span>`;
}

function pills(arr: string[] | null | undefined): string {
  if (!arr?.length) return `<span style="color:${TEXT_TERTIARY};font-style:italic;">—</span>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">${arr
    .map(
      (a) =>
        `<span style="display:inline-flex;align-items:center;padding:2px 8px;background:${PILL_BG};color:${PILL_TEXT};border-radius:9999px;font-size:12px;font-weight:500;font-family:'Inter',sans-serif;">${a}</span>`
    )
    .join('')}</div>`;
}

function field(label: string, content: string, fullWidth = false): string {
  return `<div style="display:flex;flex-direction:column;gap:4px;${fullWidth ? 'grid-column:1/-1;' : ''}">
    <span style="font-size:11px;font-weight:500;color:${TEXT_TERTIARY};text-transform:uppercase;letter-spacing:0.04em;font-family:'Inter',sans-serif;">${label}</span>
    ${content}
  </div>`;
}

function section(title: string, body: string, fullGrid = false): string {
  return `<div style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
    <div style="padding:12px 16px;background:${BG_SECTION};border-bottom:1px solid ${BORDER};">
      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${TEXT_TERTIARY};font-family:'Inter',sans-serif;">${title}</span>
    </div>
    <div style="padding:16px;display:${fullGrid ? 'flex;flex-direction:column;gap:12px' : 'grid;grid-template-columns:1fr 1fr;gap:12px 20px'};">
      ${body}
    </div>
  </div>`;
}

function table(headers: string[], rows: string[][]): string {
  const ths = headers
    .map(
      (h) =>
        `<th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:600;color:${TEXT_TERTIARY};text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid ${BORDER};font-family:'Inter',sans-serif;">${h}</th>`
    )
    .join('');
  const trs = rows
    .map(
      (row, ri) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="padding:8px 12px;color:${TEXT_SECONDARY};font-size:13px;font-family:'Inter',sans-serif;${ri < rows.length - 1 ? `border-bottom:1px solid ${BORDER};` : ''}">${cell || '—'}</td>`
          )
          .join('')}</tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;">${ths ? `<thead><tr>${ths}</tr></thead>` : ''}<tbody>${trs}</tbody></table>`;
}

export function generateOnboardingHTML(
  doc: OnboardingDocument,
  leadName?: string,
  _leadEmail?: string
): string {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const brandName = doc.brand?.name || 'Brand';
  const preparedFor = doc.brand?.contact_name || leadName || brandName;

  // ── Hero ──
  const hero = `
    <div style="background:linear-gradient(135deg,${GRAD_START} 0%,${GRAD_MID} 50%,${GRAD_END} 100%);padding:40px 40px 32px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
      <div style="position:absolute;bottom:-40px;left:30%;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>
      <div style="position:relative;z-index:1;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);margin-bottom:12px;font-family:'Inter',sans-serif;">SOCIALJET · INFLUENCER MARKETING AGENCY</div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-bottom:8px;font-family:'Inter',sans-serif;">PREPARED FOR</div>
        <h2 style="font-size:32px;font-weight:800;color:#fff;margin:0 0 16px 0;line-height:1.15;font-family:'Inter',sans-serif;">SocialJet <span style="font-weight:300;opacity:0.6;margin:0 8px;">×</span> ${brandName}</h2>
        <div style="display:inline-block;border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:4px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.8);margin-bottom:16px;font-family:'Inter',sans-serif;">ONBOARDING DOCUMENT</div>
        ${doc.brand?.summary ? `<p style="font-size:14px;color:rgba(255,255,255,0.65);margin:0 0 24px 0;max-width:600px;line-height:1.6;font-family:'Inter',sans-serif;">${doc.brand.summary}</p>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;border-top:1px solid rgba(255,255,255,0.15);padding-top:20px;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.45);font-family:'Inter',sans-serif;">PREPARED FOR</span>
            <span style="font-size:14px;font-weight:600;color:#fff;font-family:'Inter',sans-serif;">${preparedFor}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.45);font-family:'Inter',sans-serif;">BUDGET</span>
            <span style="font-size:14px;font-weight:600;color:#fff;font-family:'Inter',sans-serif;">${doc.budget || '—'}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.45);font-family:'Inter',sans-serif;">DATE</span>
            <span style="font-size:14px;font-weight:600;color:#fff;font-family:'Inter',sans-serif;">${today}</span>
          </div>
        </div>
      </div>
    </div>`;

  // ── Body sections ──
  let body = '';

  if (doc.raw_html) {
    body = doc.raw_html;
  } else {
    // Brand
    body += section(
      'Brand',
      [
        field('Brand Name', val(doc.brand?.name)),
        field('Industry', val(doc.brand?.industry)),
        field('Contact', val(doc.brand?.contact_name)),
        field('Email', val(doc.brand?.email)),
        field('Phone', val(doc.brand?.phone)),
        field('Website', val(doc.brand?.website)),
        field('Instagram', val(doc.brand?.instagram)),
        field('TikTok', val(doc.brand?.tiktok)),
        field('Facebook', val(doc.brand?.facebook)),
        ...(doc.brand?.summary ? [field('Summary', val(doc.brand.summary), true)] : []),
      ].join('')
    );

    // Campaign
    body += section(
      'Campaign',
      [
        field('Platforms', pills(doc.campaign?.platforms)),
        field('Geographic Focus', val(doc.campaign?.geographic_focus)),
        field('Marketing Message', val(doc.campaign?.marketing_message), true),
        field('Deliverables', val(doc.campaign?.deliverables), true),
        field('Objectives', pills(doc.campaign?.objectives)),
        field('Creative Angles', pills(doc.campaign?.creative_angles)),
        field('Content Timeline', val(doc.campaign?.content_timeline), true),
      ].join('')
    );

    // KOLs
    const kolRows = doc.kols?.tier_breakdown?.length
      ? section(
          'KOLs',
          [
            field('Total Count', val(doc.kols?.total_count)),
            field('Preferred Age Range', val(doc.kols?.preferred_age_range)),
            field('Ideal Profile', val(doc.kols?.ideal_profile), true),
            field('No-Gos', pills(doc.kols?.no_gos)),
            field(
              'Tier Breakdown',
              table(
                ['Tier', 'Count'],
                (doc.kols?.tier_breakdown ?? []).map((t) => [t.tier, String(t.count ?? '—')])
              ),
              true
            ),
          ].join('')
        )
      : section(
          'KOLs',
          [
            field('Total Count', val(doc.kols?.total_count)),
            field('Preferred Age Range', val(doc.kols?.preferred_age_range)),
            field('Ideal Profile', val(doc.kols?.ideal_profile), true),
            field('No-Gos', pills(doc.kols?.no_gos)),
          ].join('')
        );
    body += kolRows;

    // Content
    body += section(
      'Content',
      [
        field('Type Preferences', pills(doc.content?.type_preferences)),
        field('Tone & Style', val(doc.content?.tone_and_style)),
        field('Mandatory Inclusions', pills(doc.content?.mandatory_inclusions)),
        field("Content Don'ts", pills(doc.content?.content_donts)),
      ].join('')
    );

    // Product
    body += section(
      'Product',
      [
        field('Main Products', pills(doc.product?.main_products)),
        field('USPs', pills(doc.product?.usps)),
        field('Delivery By', val(doc.product?.delivery_by)),
        field('Loan / Given', val(doc.product?.loan_or_given)),
        field('Lead Time (days)', val(doc.product?.lead_time_days)),
      ].join('')
    );

    // Offer & CTA
    body += section(
      'Offer & CTA',
      [
        field('Offer', val(doc.offer_and_cta?.offer)),
        field('CTA', val(doc.offer_and_cta?.cta)),
        field('CTA Links', pills(doc.offer_and_cta?.cta_links), true),
      ].join('')
    );

    // Budget & Timeline
    const timelineFields = [
      field('Budget', val(doc.budget)),
      field('Posting Schedule', val(doc.timeline?.posting_schedule)),
      field('Start Date', val(doc.timeline?.start_date)),
      field('End Date', val(doc.timeline?.end_date)),
    ];
    if (doc.timeline?.key_dates?.length) {
      timelineFields.push(
        field(
          'Key Dates',
          table(
            ['Date', 'Milestone', 'Owner'],
            doc.timeline.key_dates.map((d) => [d.date, d.milestone, d.owner])
          ),
          true
        )
      );
    }
    body += section('Budget & Timeline', timelineFields.join(''));

    // Next Steps
    if (doc.next_steps?.length) {
      body += section(
        'Next Steps',
        field(
          '',
          table(
            ['Action', 'Owner', 'Deadline'],
            doc.next_steps.map((s) => [s.action, s.owner, s.deadline])
          ),
          true
        ),
        true
      );
    }

    // Pending Items
    if (doc.pending_items?.length) {
      body += section(
        'Pending Items',
        field(
          '',
          table(
            ['Item', 'From', 'Deadline'],
            doc.pending_items.map((p) => [p.item, p.from, p.deadline])
          ),
          true
        ),
        true
      );
    }
  }

  const card = `
    <div style="background:#fff;overflow:hidden;">
      ${hero}
      <div style="padding:24px;display:flex;flex-direction:column;gap:16px;">
        ${body}
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>SocialJet × ${brandName} — Onboarding Document</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{margin:0;size:A4;}
  @media print{
    html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
  }
</style>
</head>
<body>
  ${card}
</body>
</html>`;
}

// Returns just the inner card HTML (no full page wrapper) for embedding
export function generateOnboardingCardHTML(doc: OnboardingDocument, leadName?: string): string {
  const full = generateOnboardingHTML(doc, leadName);
  const bodyMatch = full.match(/<body[^>]*>([\s\S]*)<\/body>/);
  return bodyMatch ? bodyMatch[1].trim() : full;
}
