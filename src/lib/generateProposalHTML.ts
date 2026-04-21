import type { SalesAnalysis } from '@/types/intelligence.types';

// ── Design tokens (all literal — no CSS variables so PDF/Word stays intact) ───
const PURPLE = '#6c63ff';
const PURPLE_MID = '#8b5cf6';
const PURPLE_LIGHT = '#f3f2ff';
const BORDER = '#e8e8f0';
const TEXT_DARK = '#111827';
const TEXT_MID = '#374151';
const TEXT_LIGHT = '#6b7280';
const TEXT_TINY = '#9ca3af';

// ── Primitives ─────────────────────────────────────────────────────────────────

function sectionLabel(title: string): string {
  return `<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.13em;color:${PURPLE};margin:0 0 12px 0;padding-bottom:9px;border-bottom:1.5px solid ${PURPLE_LIGHT};font-family:'Inter',sans-serif;">${title}</div>`;
}

function section(title: string, body: string): string {
  return `<div class="section-wrap" style="margin:0 0 28px 0;">${sectionLabel(title)}${body}</div>`;
}

function p(text: string, small = false): string {
  return `<p style="font-size:${small ? 13 : 14}px;color:${TEXT_MID};line-height:1.72;margin:0 0 8px 0;font-family:'Inter',sans-serif;">${text}</p>`;
}

// ── Blocks ─────────────────────────────────────────────────────────────────────

function proposalMeta(data: SalesAnalysis, date: string): string {
  const client =
    data.participants
      ?.find((p: string) => p.toLowerCase().includes('prospect'))
      ?.replace(/\s*\(.*\)/, '') ?? '';
  const company = data.brand_name || '';
  const budget = (data.budget || '').replace(/\s*\(.*$/, '').trim();

  const items = [
    client ? { label: 'Prepared For', value: client + (company ? `, ${company}` : '') } : null,
    budget ? { label: 'Budget', value: budget } : null,
    { label: 'Date', value: date },
  ].filter(Boolean) as { label: string; value: string }[];

  return `<div style="display:flex;gap:0;border-top:1px solid rgba(255,255,255,0.15);margin-top:40px;padding-top:24px;">
    ${items
      .map(
        (item, i) => `
      <div style="flex:1;${i < items.length - 1 ? `border-right:1px solid rgba(255,255,255,0.15);` : ''}padding:0 ${i === 0 ? '24px 0 0' : '24px'};">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:6px;">${item.label}</div>
        <div style="font-size:13px;font-weight:600;color:#fff;line-height:1.4;">${item.value}</div>
      </div>`
      )
      .join('')}
  </div>`;
}

function pricingTable(tiers: SalesAnalysis['pricing_tiers'], note?: string): string {
  return `
    ${note ? `<p style="font-size:12px;color:${TEXT_LIGHT};line-height:1.65;margin:0 0 14px 0;font-style:italic;border-left:3px solid ${BORDER};padding-left:12px;">${note}</p>` : ''}
    <div>
      ${tiers
        .map(
          (
            t,
            i
          ) => `<div style="border:${i === tiers.length - 1 ? `2px solid ${PURPLE}` : `1px solid ${BORDER}`};border-radius:10px;padding:16px 18px;margin-bottom:10px;page-break-inside:avoid;${i === tiers.length - 1 ? `background:${PURPLE_LIGHT};` : ''}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px;">
              <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};">${t.package_name}${i === tiers.length - 1 ? ` <span style="font-size:10px;font-weight:700;color:#fff;background:${PURPLE};padding:2px 7px;border-radius:4px;vertical-align:middle;">RECOMMENDED</span>` : ''}</div>
              <div style="font-size:16px;font-weight:800;color:${PURPLE};white-space:nowrap;">${t.price}</div>
            </div>
            <div style="font-size:12px;color:${TEXT_MID};line-height:1.62;margin-bottom:6px;">${t.description}</div>
            ${t.influencer_count_range ? `<div style="font-size:11px;color:${TEXT_LIGHT};">${t.influencer_count_range}</div>` : ''}
          </div>`
        )
        .join('')}
    </div>`;
}

function timelineBlock(milestones: SalesAnalysis['timeline_milestones']): string {
  const rows = milestones
    .map(
      (m, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
      <td style="padding:12px 14px;font-size:11px;font-weight:700;color:${PURPLE};white-space:nowrap;vertical-align:top;border-bottom:1px solid ${BORDER};">${m.week || `Week ${i + 1}`}</td>
      <td style="padding:12px 14px;vertical-align:top;border-bottom:1px solid ${BORDER};">
        <div style="font-size:14px;font-weight:700;color:${TEXT_DARK};margin-bottom:3px;">${m.milestone}</div>
        ${m.deliverable ? `<div style="font-size:11px;font-weight:600;color:${PURPLE};opacity:0.8;">${m.deliverable}</div>` : ''}
      </td>
      <td style="padding:12px 14px;font-size:13px;color:${TEXT_MID};line-height:1.68;vertical-align:top;border-bottom:1px solid ${BORDER};">${m.description}</td>
    </tr>`
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:${PURPLE};">
        <th style="padding:10px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.85);text-align:left;white-space:nowrap;">Week</th>
        <th style="padding:10px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.85);text-align:left;">Milestone</th>
        <th style="padding:10px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.85);text-align:left;">Activities</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function metricsBlock(metrics: SalesAnalysis['key_success_metrics']): string {
  return metrics
    .map(
      (
        m
      ) => `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid ${BORDER};page-break-inside:avoid;">
        <div style="flex-shrink:0;width:4px;background:${PURPLE};border-radius:2px;"></div>
        <div>
          <div style="font-size:14px;font-weight:700;color:${TEXT_DARK};margin-bottom:3px;">${m.metric}</div>
          <div style="font-size:13px;color:${TEXT_LIGHT};line-height:1.62;">${m.description}</div>
        </div>
      </div>`
    )
    .join('');
}

function contentTypesBlock(types: SalesAnalysis['content_types']): string {
  return types
    .map(
      (ct) => `<div style="margin-bottom:16px;page-break-inside:avoid;">
        <div style="font-size:13px;font-weight:700;color:${TEXT_DARK};margin-bottom:4px;">
          ${ct.name}
          ${ct.is_suggested ? `<span style="font-size:10px;font-weight:600;color:${PURPLE};background:${PURPLE_LIGHT};padding:1px 7px;border-radius:4px;margin-left:6px;vertical-align:middle;">Suggested</span>` : ''}
        </div>
        <div style="font-size:13px;color:${TEXT_MID};line-height:1.68;">${ct.description}</div>
      </div>`
    )
    .join('');
}

function divider(): string {
  return `<div style="height:1px;background:${BORDER};margin:8px 0 30px 0;"></div>`;
}

// ── Page content (shared between screen & download) ────────────────────────────

export function generateProposalPageHTML(data: SalesAnalysis): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const body: string[] = [];

  // Executive Summary
  if (data.call_summary) body.push(section('Executive Summary', p(data.call_summary)));

  // Campaign Objective
  if (data.campaign_objective)
    body.push(
      section(
        'Campaign Objective',
        `<div style="background:${PURPLE_LIGHT};border-left:4px solid ${PURPLE};border-radius:0 8px 8px 0;padding:14px 18px;">
          <p style="font-size:14px;font-weight:600;color:${TEXT_DARK};line-height:1.6;margin:0;">${data.campaign_objective}</p>
        </div>`
      )
    );

  // Situation Analysis — current situation + objectives as clean paragraphs
  if (data.current_situation || data.objectives) {
    const situationParts: string[] = [];
    if (data.current_situation)
      situationParts.push(`
      <div style="margin-bottom:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:${TEXT_LIGHT};margin-bottom:5px;">Current Situation</div>
        <p style="font-size:13px;color:${TEXT_MID};line-height:1.72;margin:0;">${data.current_situation}</p>
      </div>`);
    if (data.objectives)
      situationParts.push(`
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:${TEXT_LIGHT};margin-bottom:5px;">Objectives</div>
        <p style="font-size:13px;color:${TEXT_MID};line-height:1.72;margin:0;">${data.objectives}</p>
      </div>`);
    body.push(section('Situation Analysis', situationParts.join('')));
  }

  // Key Challenges — parse numbered items into individual cards
  if (data.key_challenges) {
    const raw = data.key_challenges;
    const items = raw.split(/\d+\)\s+/).filter((s: string) => s.trim().length > 0);
    const challengeHTML =
      items.length > 1
        ? items
            .map((item: string, i: number) => {
              const colonIdx = item.indexOf(':');
              const dashIdx2 =
                item.indexOf(' — ') !== -1 ? item.indexOf(' — ') : item.indexOf(' – ');
              const splitIdx = colonIdx !== -1 ? colonIdx : dashIdx2;
              const splitLen = colonIdx !== -1 ? 1 : 3;
              const title =
                splitIdx !== -1 && splitIdx < 60
                  ? item.slice(0, splitIdx).trim()
                  : `Challenge ${i + 1}`;
              const desc =
                splitIdx !== -1 && splitIdx < 60
                  ? item.slice(splitIdx + splitLen).trim()
                  : item.trim();
              return `<div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid ${BORDER};page-break-inside:avoid;">
            <div style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:${PURPLE_LIGHT};border:1.5px solid ${PURPLE};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${PURPLE};margin-top:1px;">${i + 1}</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:${TEXT_DARK};margin-bottom:3px;">${title}</div>
              <div style="font-size:13px;color:${TEXT_MID};line-height:1.68;">${desc}</div>
            </div>
          </div>`;
            })
            .join('')
        : `<p style="font-size:13px;color:${TEXT_MID};line-height:1.72;margin:0;">${raw}</p>`;
    body.push(section('Key Challenges', challengeHTML));
  }

  // Target Audience
  if (data.target_audience) {
    const ta = data.target_audience;
    const rows: string[] = [];
    if (ta.primary_audience)
      rows.push(`<strong style="color:${TEXT_DARK};">Primary:</strong> ${ta.primary_audience}`);
    if (ta.secondary_audience)
      rows.push(`<strong style="color:${TEXT_DARK};">Secondary:</strong> ${ta.secondary_audience}`);
    if (ta.psychographics)
      rows.push(
        `<strong style="color:${TEXT_DARK};">Psychographics:</strong> ${ta.psychographics}`
      );
    if (ta.behavioral_traits)
      rows.push(`<strong style="color:${TEXT_DARK};">Behaviour:</strong> ${ta.behavioral_traits}`);
    const demo = ta.demographics
      ? Object.entries(ta.demographics)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
          .join(' · ')
      : '';
    if (demo) rows.push(`<strong style="color:${TEXT_DARK};">Demographics:</strong> ${demo}`);
    if (rows.length) body.push(section('Target Audience', rows.map((r) => p(r)).join('')));
  }

  // Strategy — parse Phase 1 / Phase 2 / Phase 3 into step cards, rest as paragraph
  if (data.strategy) {
    const phaseRegex = /Phase\s+\d+\s*\([^)]+\):/gi;
    const phases = data.strategy.split(phaseRegex);
    const phaseLabels = data.strategy.match(phaseRegex) ?? [];

    if (phaseLabels.length >= 2) {
      const intro = phases[0].trim();
      const phaseCards = phaseLabels
        .map((label: string, i: number) => {
          const content = (phases[i + 1] || '').trim();
          const cleanLabel = label.replace(/:$/, '');
          return `<div style="border:1px solid ${BORDER};border-radius:8px;padding:14px 16px;margin-bottom:10px;page-break-inside:avoid;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:${PURPLE};margin-bottom:6px;">${cleanLabel}</div>
          <p style="font-size:12px;color:${TEXT_MID};line-height:1.68;margin:0;">${content}</p>
        </div>`;
        })
        .join('');
      const strategyHTML =
        (intro
          ? `<p style="font-size:13px;color:${TEXT_MID};line-height:1.72;margin:0 0 16px 0;">${intro}</p>`
          : '') + phaseCards;
      body.push(section('Strategy', strategyHTML));
    } else {
      body.push(section('Strategy', p(data.strategy)));
    }
  }

  // Marketing Message
  if (data.marketing_message)
    body.push(
      section(
        'Marketing Message',
        `<blockquote style="border-left:4px solid ${PURPLE};margin:0;padding:12px 18px;background:${PURPLE_LIGHT};border-radius:0 8px 8px 0;">
          <p style="font-size:14px;font-style:italic;color:${TEXT_DARK};margin:0;line-height:1.65;">&ldquo;${data.marketing_message}&rdquo;</p>
        </blockquote>`
      )
    );

  // Pricing
  if (data.pricing_tiers?.length)
    body.push(section('Investment Packages', pricingTable(data.pricing_tiers, data.pricing_note)));

  // Package Inclusions — 2-col checklist grid
  if (data.package_inclusions?.length) {
    const checkItems = data.package_inclusions
      .map(
        (item: string) => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid ${BORDER};">
        <div style="flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${PURPLE};display:flex;align-items:center;justify-content:center;margin-top:1px;">
          <span style="color:#fff;font-size:10px;font-weight:700;line-height:1;">✓</span>
        </div>
        <span style="font-size:12px;color:${TEXT_MID};line-height:1.6;">${item}</span>
      </div>`
      )
      .join('');

    const half = Math.ceil(data.package_inclusions.length / 2);
    const col1 = data.package_inclusions
      .slice(0, half)
      .map(
        (item: string) => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid ${BORDER};">
        <div style="flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${PURPLE};display:flex;align-items:center;justify-content:center;margin-top:1px;">
          <span style="color:#fff;font-size:10px;font-weight:700;line-height:1;">✓</span>
        </div>
        <span style="font-size:12px;color:${TEXT_MID};line-height:1.6;">${item}</span>
      </div>`
      )
      .join('');
    const col2 = data.package_inclusions
      .slice(half)
      .map(
        (item: string) => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid ${BORDER};">
        <div style="flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${PURPLE};display:flex;align-items:center;justify-content:center;margin-top:1px;">
          <span style="color:#fff;font-size:10px;font-weight:700;line-height:1;">✓</span>
        </div>
        <span style="font-size:12px;color:${TEXT_MID};line-height:1.6;">${item}</span>
      </div>`
      )
      .join('');

    void checkItems;
    body.push(
      section(
        "What's Included",
        `<div style="display:flex;gap:32px;">
        <div style="flex:1;">${col1}</div>
        <div style="flex:1;">${col2}</div>
      </div>`
      )
    );
  }

  // Value Adds — highlighted cards
  if (data.value_adds?.length) {
    const cards = data.value_adds
      .map(
        (item: string) => `
      <div style="display:flex;align-items:flex-start;gap:12px;background:${PURPLE_LIGHT};border-radius:8px;padding:12px 14px;">
        <span style="flex-shrink:0;font-size:14px;margin-top:1px;">★</span>
        <span style="font-size:12px;color:${TEXT_DARK};line-height:1.6;font-weight:500;">${item}</span>
      </div>`
      )
      .join('');
    body.push(
      section(
        'Value Adds',
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${cards}</div>`
      )
    );
  }

  // Content Types
  if (data.content_types?.length)
    body.push(section('Content Types', contentTypesBlock(data.content_types)));

  // Timeline
  if (data.timeline_milestones?.length)
    body.push(section('Campaign Timeline', timelineBlock(data.timeline_milestones)));

  // Metrics
  if (data.key_success_metrics?.length)
    body.push(section('Key Success Metrics', metricsBlock(data.key_success_metrics)));

  // Expected Outcomes
  if (data.expected_outcomes) body.push(section('Expected Outcomes', p(data.expected_outcomes)));

  // Recommended Ad Budget
  if (data.recommended_ad_budget?.daily_budget) {
    const rab = data.recommended_ad_budget;
    const rows = [
      rab.daily_budget
        ? `<strong style="color:${TEXT_DARK};">Daily Budget:</strong> ${rab.daily_budget}`
        : '',
      rab.duration
        ? `<strong style="color:${TEXT_DARK};">Active Period:</strong> ${rab.duration}`
        : '',
      rab.adjustment_note
        ? `<strong style="color:${TEXT_DARK};">Note:</strong> ${rab.adjustment_note}`
        : '',
    ].filter(Boolean);
    body.push(section('Recommended Ad Budget', rows.map((r) => p(r)).join('')));
  }

  return `
    <!-- Cover -->
    <div style="background:linear-gradient(160deg,#1a1040 0%,${PURPLE} 60%,${PURPLE_MID} 100%);padding:56px 56px 48px;width:100%;margin:0;">

      <!-- Agency label -->
      <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:48px;">
        SocialJet &nbsp;·&nbsp; Influencer Marketing Agency
      </div>

      <!-- Main heading: SocialJet × Brand -->
      <div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:14px;">Prepared for</div>
        <h1 style="font-size:42px;font-weight:800;color:#ffffff;line-height:1.1;margin:0;letter-spacing:-0.5px;">
          SocialJet <span style="color:rgba(255,255,255,0.35);font-weight:300;margin:0 6px;">×</span> ${data.brand_name || 'Client'}
        </h1>
      </div>

      <!-- Proposal type tag -->
      <div style="display:inline-block;border:1px solid rgba(255,255,255,0.25);border-radius:4px;padding:5px 14px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:32px;">
        Influencer Marketing Proposal
      </div>

      <!-- Campaign objective -->
      ${
        data.campaign_objective
          ? `
      <div style="border-left:3px solid rgba(255,255,255,0.3);padding-left:20px;margin-bottom:0;max-width:580px;">
        <p style="font-size:15px;font-weight:400;color:rgba(255,255,255,0.85);line-height:1.65;margin:0;font-family:'Inter',sans-serif;">${data.campaign_objective}</p>
      </div>`
          : ''
      }

      <!-- Meta strip -->
      ${proposalMeta(data, date)}
    </div>

    <!-- Body -->
    <div style="padding:36px 48px 48px;">
      ${body.join('\n')}
    </div>

    <!-- Footer -->
    ${divider()}
    <div style="padding:0 48px 32px;display:flex;justify-content:space-between;align-items:center;">
      <a href="https://socialjet.sg" target="_blank" style="font-size:12px;font-weight:700;color:${PURPLE};text-decoration:none;">SocialJet · socialjet.sg</a>
      <span style="font-size:11px;color:${TEXT_TINY};">Confidential — prepared exclusively for this engagement</span>
    </div>`;
}

// ── Full standalone HTML doc (for PDF / Word download) ─────────────────────────

export function generateProposalHTML(data: SalesAnalysis): string {
  const pageContent = generateProposalPageHTML(data);
  const title = data.brand_name
    ? `SocialJet × ${data.brand_name} — Proposal`
    : 'SocialJet — Proposal';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:${TEXT_DARK};-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;font-size:14px;line-height:1.7;-webkit-font-smoothing:antialiased;}
    a{color:inherit!important;text-decoration:none!important;}
    @page{size:A4 portrait;margin:12mm 0 0 0;}
    @page:first{margin:0;}
    @media print{
      body{background:#fff;}
      .doc-page{box-shadow:none!important;margin:0!important;border-radius:0!important;}
      .section-wrap{page-break-inside:avoid;}
    }
  </style>
</head>
<body>
  <div class="doc-page" style="width:100%;max-width:100%;background:#fff;overflow:hidden;">
    ${pageContent}
  </div>
</body>
</html>`;
}

/** @deprecated kept for any stale imports */
export const proposalDocumentCSS = '';
