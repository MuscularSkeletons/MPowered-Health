// This file turns pain-profile sections into clear text and HTML reports.
export type ProfileSection = {
  // Each item becomes one labelled row in both text and HTML output.
  title: string;
  subtitle: string;
  items: [string, string][];
};

export type PainProfileReport = {
  // The screen assembles sections; this module is responsible only for presentation.
  updatedAt: string;
  sections: ProfileSection[];
};

const escapeHtml = (value: string) =>
  // Prevent names, answers, or notes from becoming executable HTML markup.
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export function profileReportText(report: PainProfileReport) {
  // Plain text supports the system share sheet and manual copying on the web.
  return [
    'My Pain Profile',
    report.updatedAt ? `Updated ${report.updatedAt}` : 'No completed assessments yet',
    'A summary of your latest completed assessments.',
    ...report.sections.map((section) =>
      // Keep each section together, then separate sections with a blank line.
      [
        section.title,
        section.subtitle,
        ...section.items.map(
          ([label, value]) => `${label.replace(/:$/, '')}: ${value || 'Not recorded'}`,
        ),
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n\n');
}

export function profileReportHtml(report: PainProfileReport) {
  // Inline all print styles so the report works inside an isolated print frame.
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Pain Profile</title><style>
@page { size: A4; margin: 16mm; }
* { box-sizing: border-box; }
body { margin: 0; color: #292033; font: 12pt/1.5 Arial, sans-serif; overflow-wrap: anywhere; }
h1 { margin: 0 0 4px; font-size: 26pt; }
h2 { margin: 0; font-size: 17pt; break-after: avoid; }
p { margin: 4px 0 12px; }
.meta, dt { color: #686173; }
section { margin-top: 20px; padding-top: 12px; border-top: 1px solid #d5cfdc; }
.subtitle { font-size: 10pt; }
dl { margin: 8px 0 0; }
.row { margin-bottom: 10px; break-inside: avoid; }
dt { font-size: 10pt; }
dd { margin: 0; white-space: pre-wrap; }
</style></head><body><h1>My Pain Profile</h1>
<p class="meta">${escapeHtml(report.updatedAt ? `Updated ${report.updatedAt}` : 'No completed assessments yet')}</p>
<p>A summary of your latest completed assessments.</p>
${report.sections
  // Escape every dynamic heading, label, and value before adding it to the document.
  .map(
    (section) => `<section><h2>${escapeHtml(section.title)}</h2>
${section.subtitle ? `<p class="subtitle">${escapeHtml(section.subtitle)}</p>` : ''}
<dl>${section.items.map(([label, value]) => `<div class="row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'Not recorded')}</dd></div>`).join('')}</dl></section>`,
  )
  .join('')}
</body></html>`;
}
