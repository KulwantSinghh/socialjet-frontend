import type { SalesAnalysis } from '@/types/intelligence.types';

export function generateProposalHTML(data: SalesAnalysis): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const propNo = `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

  const s: string[] = [];

  // ── Cover block ──────────────────────────────────────
  s.push(
    `<p style="color:#9ca3af;font-size:11px;margin:0 0 6px 0;letter-spacing:0.08em;text-transform:uppercase;">Proposal &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; ${propNo}</p>`
  );
  s.push(
    `<h1 style="font-size:28px;font-weight:800;margin:0 0 10px 0;line-height:1.2;">${data.campaign_objective || 'Campaign Proposal'}</h1>`
  );
  if (data.client_needs)
    s.push(`<p style="color:#6b7280;font-size:14px;margin:0 0 12px 0;">${data.client_needs}</p>`);
  if (data.budget || data.timeline) {
    const pills: string[] = [];
    if (data.budget) pills.push(`<strong>Budget:</strong> ${data.budget}`);
    if (data.timeline) pills.push(`<strong>Timeline:</strong> ${data.timeline}`);
    s.push(`<p style="font-size:13px;color:#374151;">${pills.join(' &nbsp;|&nbsp; ')}</p>`);
  }
  if (data.participants?.length > 0) {
    s.push(
      `<p style="font-size:13px;color:#6b7280;margin:4px 0 0 0;"><strong>Participants:</strong> ${data.participants.join(', ')}</p>`
    );
  }
  s.push(`<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`);

  // ── Executive Summary ────────────────────────────────
  if (data.call_summary) {
    s.push(`<h2>Executive Summary</h2><p>${data.call_summary}</p>`);
  }

  // ── Situation Analysis ───────────────────────────────
  if (data.current_situation || data.objectives || data.key_challenges) {
    s.push(`<h2>Situation Analysis</h2>`);
    if (data.current_situation)
      s.push(`<h3>Current Situation</h3><p>${data.current_situation}</p>`);
    if (data.objectives) s.push(`<h3>Objectives</h3><p>${data.objectives}</p>`);
    if (data.key_challenges) s.push(`<h3>Key Challenges</h3><p>${data.key_challenges}</p>`);
  }

  // ── Strategy ─────────────────────────────────────────
  if (data.strategy) {
    s.push(`<h2>Our Strategy</h2><p>${data.strategy}</p>`);
  }

  // ── Marketing Message ─────────────────────────────────
  if (data.marketing_message) {
    s.push(`<h2>Marketing Message</h2><p><em>&ldquo;${data.marketing_message}&rdquo;</em></p>`);
  }

  // ── Execution Plan ────────────────────────────────────
  if (data.execution_plan?.length > 0) {
    s.push(
      `<h2>Execution Plan</h2><ol>${data.execution_plan.map((step) => `<li>${step}</li>`).join('')}</ol>`
    );
  }

  // ── Target Audience ───────────────────────────────────
  if (data.target_audience) {
    const ta = data.target_audience;
    if (ta.primary_audience || ta.secondary_audience || ta.psychographics || ta.behavioral_traits) {
      s.push(`<h2>Target Audience</h2>`);
      if (ta.primary_audience) s.push(`<h3>Primary Audience</h3><p>${ta.primary_audience}</p>`);
      if (ta.secondary_audience)
        s.push(`<h3>Secondary Audience</h3><p>${ta.secondary_audience}</p>`);
      if (ta.psychographics) s.push(`<p><strong>Psychographics:</strong> ${ta.psychographics}</p>`);
      if (ta.behavioral_traits)
        s.push(`<p><strong>Behavioral Traits:</strong> ${ta.behavioral_traits}</p>`);
      if (ta.demographics) {
        const entries = Object.entries(ta.demographics).filter(([, v]) => v);
        if (entries.length > 0) {
          s.push(
            `<p><strong>Demographics:</strong> ${entries.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ')}</p>`
          );
        }
      }
    }
  }

  // ── Content Types ─────────────────────────────────────
  if (data.content_types?.length > 0) {
    s.push(`<h2>Content Types</h2>`);
    data.content_types.forEach((ct) => {
      s.push(`<h3>${ct.name}</h3><p>${ct.description}</p>`);
    });
  }

  // ── Investment Packages ───────────────────────────────
  if (data.pricing_tiers?.length > 0) {
    s.push(`<h2>Investment Packages</h2>`);
    if (data.pricing_note) s.push(`<p><em>${data.pricing_note}</em></p>`);
    data.pricing_tiers.forEach((t) => {
      s.push(`<h3>${t.package_name} — ${t.price}</h3><p>${t.description}</p>`);
      if (t.influencer_count_range)
        s.push(`<p style="color:#6b7280;font-size:13px;">${t.influencer_count_range}</p>`);
    });
  }

  // ── Execution Timeline ────────────────────────────────
  if (data.timeline_milestones?.length > 0) {
    s.push(`<h2>Execution Timeline</h2><ol>`);
    data.timeline_milestones.forEach((m) => {
      s.push(
        `<li><strong>${m.milestone}</strong>${m.week ? ` (${m.week})` : ''}<br/>${m.deliverable ? `<em>${m.deliverable}</em><br/>` : ''}${m.description}</li>`
      );
    });
    s.push(`</ol>`);
  }

  // ── Key Success Metrics ───────────────────────────────
  if (data.key_success_metrics?.length > 0) {
    s.push(`<h2>Key Success Metrics</h2><ul>`);
    data.key_success_metrics.forEach((m) => {
      s.push(
        `<li><strong>${m.metric}:</strong> ${m.target} — <span style="color:#6b7280;">${m.description}</span></li>`
      );
    });
    s.push(`</ul>`);
  }

  // ── Package Inclusions ────────────────────────────────
  if (data.package_inclusions?.length > 0) {
    s.push(
      `<h2>What&apos;s Included</h2><ul>${data.package_inclusions.map((i) => `<li>${i}</li>`).join('')}</ul>`
    );
  }

  // ── Value Adds ────────────────────────────────────────
  if (data.value_adds?.length > 0) {
    s.push(`<h2>Value Adds</h2><ul>${data.value_adds.map((i) => `<li>${i}</li>`).join('')}</ul>`);
  }

  // ── Special Offer ─────────────────────────────────────
  if (data.offer_details?.offer_type) {
    s.push(
      `<h2>Special Offer</h2><p><strong>${data.offer_details.offer_type}</strong></p><p>${data.offer_details.description}</p>`
    );
    if (data.offer_details.call_to_action)
      s.push(`<p><em>${data.offer_details.call_to_action}</em></p>`);
  }

  // ── Next Steps ────────────────────────────────────────
  if (data.next_steps) {
    s.push(`<h2>Next Steps</h2><p>${data.next_steps}</p>`);
  }

  // ── Expected Outcomes ─────────────────────────────────
  if (data.expected_outcomes) {
    s.push(`<h2>Expected Outcomes</h2><p>${data.expected_outcomes}</p>`);
  }

  // ── Footer ────────────────────────────────────────────
  s.push(`<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px 0;" />`);
  s.push(
    `<p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">Confidential — Prepared by SocialJet exclusively for this engagement</p>`
  );

  return s.join('\n');
}

/** CSS injected into the downloaded PDF/DOC wrapper */
export const proposalDocumentCSS = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    color: #111827;
    line-height: 1.65;
    margin: 0;
    padding: 0;
  }
  h1 { font-size: 26px; font-weight: 800; margin: 0 0 10px 0; color: #111827; }
  h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6c63ff; margin: 28px 0 10px 0; padding-bottom: 8px; border-bottom: 1.5px solid #ede9fe; }
  h3 { font-size: 14px; font-weight: 700; color: #374151; margin: 14px 0 4px 0; }
  p { margin: 0 0 10px 0; }
  ul, ol { margin: 0 0 12px 0; padding-left: 20px; }
  li { margin-bottom: 5px; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  a { color: #6c63ff; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  blockquote { border-left: 3px solid #ede9fe; margin: 0; padding-left: 16px; color: #4b5563; font-style: italic; }
  img { max-width: 100%; height: auto; border-radius: 8px; }
`;
