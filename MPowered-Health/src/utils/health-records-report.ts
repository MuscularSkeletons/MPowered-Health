// This file builds printable health-record reports from saved pain assessments.
import {
  PainAssessmentRecord,
  PainMetric,
  painMetricValue,
  painRecordDate,
} from '../constants/pain-history';
// User-entered labels must be escaped before they are inserted into the print document.
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (value) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!,
  );

export function buildHealthRecordsHtml(
  records: PainAssessmentRecord[],
  areaLabel: string,
  metric: PainMetric,
) {
  // Build chart values and short date labels from the selected area group only.
  const chart = records.map((record) => painMetricValue(record, metric));
  const chartDates = records.map((record) => painRecordDate(record, true));
  // Expo Print renders HTML through WebKit. Keep the report self-contained and use
  // print-safe SVG/CSS so charts and table rows paginate without being clipped.
  const rows = [...records]
    // Show the latest assessment first in the detail table.
    .reverse()
    .map((record) => [
      painRecordDate(record),
      String(record.average),
      String(record.worst),
      String(record.mildest),
    ])
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row[0])}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`,
    )
    .join('');
  const chartLeft = 42,
    chartRight = 650,
    chartTop = 18,
    chartBottom = 178;
  // Spread points across the available width, centring a chart with one result.
  const chartX = (index: number) =>
    chart.length === 1
      ? (chartLeft + chartRight) / 2
      : chartLeft + (index * (chartRight - chartLeft)) / (chart.length - 1);
  const chartY = (score: number) => chartBottom - (score / 10) * (chartBottom - chartTop);
  // These strings become the line and shaded area coordinates in the SVG.
  const chartPoints = chart.map((score, index) => `${chartX(index)},${chartY(score)}`).join(' ');
  const chartArea = `${chartX(0)},${chartBottom} ${chartPoints} ${chartX(chart.length - 1)},${chartBottom}`;
  const horizontalGrid = Array.from(
    // Draw one horizontal guide for every possible score from zero to ten.
    { length: 11 },
    (_, score) =>
      `<line x1="${chartLeft}" x2="${chartRight}" y1="${chartY(score)}" y2="${chartY(score)}" stroke="#D5CFDC" stroke-width="1" stroke-dasharray="3 4"/><text x="30" y="${chartY(score) + 4}" text-anchor="end" font-size="10" fill="#686173">${score}</text>`,
  ).join('');
  const verticalGrid = chart
    .map(
      (_, index) =>
        `<line x1="${chartX(index)}" x2="${chartX(index)}" y1="${chartTop}" y2="${chartBottom}" stroke="#E5DFF0" stroke-width="1" stroke-dasharray="3 4"/>`,
    )
    .join('');
  const chartLabels = chartDates
    // Limit date labels on long histories so they remain readable when printed.
    .map((date, index) =>
      date && (index % Math.max(1, Math.ceil(chart.length / 8)) === 0 || index === chart.length - 1)
        ? `<text x="${chartX(index)}" y="202" text-anchor="middle" font-size="9" fill="#686173">${date}</text>`
        : '',
    )
    .join('');
  const chartDots = chart
    .map(
      (score, index) =>
        `<circle cx="${chartX(index)}" cy="${chartY(score)}" r="4" fill="#5E17EB"/>`,
    )
    .join('');
  const chartSvg = `<svg viewBox="0 0 680 215" role="img" aria-label="${metric} pain intensity chart">${chart.length > 1 ? `<polygon points="${chartArea}" fill="#D8C7FA" fill-opacity="0.48"/>` : ''}${horizontalGrid}${verticalGrid}<polyline points="${chartPoints}" fill="none" stroke="#8C52FF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${chartDots}${chartLabels}</svg>`;
  // Return one self-contained document so native and web printing need no extra assets.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>My health tracking records</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    @page{size:A4 portrait;margin:14mm}
    *{box-sizing:border-box}
    html,body{width:100%;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#201A2B;font-size:13px;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .report{width:100%}
    .brand{border-bottom:3px solid #D8C7FA;padding-bottom:12px;white-space:nowrap}
    .m{font-size:36px;font-weight:900}.powered{font-size:14px;font-weight:800;vertical-align:top}.health{font-size:27px;font-weight:900;color:#8C52FF;margin-left:8px}
    h1{font-size:25px;line-height:1.2;margin:22px 0 5px}.subtitle{color:#686173;margin-bottom:18px}
    .summary{background:#F3EEFF;border:1px solid #BEA1F7;border-radius:14px;padding:15px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
    .summary strong{color:#5E17EB;font-size:18px}
    .chart-card{border:1px solid #E5DFF0;border-radius:14px;padding:13px 14px 8px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
    .chart-title{font-size:16px;font-weight:800;margin-bottom:2px}.chart-caption{font-size:11px;color:#686173;margin-bottom:5px}.chart-card svg{display:block;width:100%;height:auto;max-height:205px}
    h2{font-size:16px;margin:0 0 9px;break-after:avoid;page-break-after:avoid}
    table{width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #E5DFF0}
    thead{display:table-header-group}tfoot{display:table-footer-group}
    tr{break-inside:avoid;page-break-inside:avoid}
    th{background:#5E17EB;color:#fff;text-align:left;padding:10px;border:1px solid #5E17EB}
    td{padding:9px 10px;border:1px solid #E5DFF0;word-wrap:break-word}
    th:first-child,td:first-child{width:40%}tr:nth-child(even) td{background:#F9F8FC}
    .footer{margin-top:18px;padding-top:10px;border-top:1px solid #E5DFF0;color:#686173;font-size:10px;break-inside:avoid;page-break-inside:avoid}
  </style></head><body><main class="report"><div class="brand"><span class="m">M</span><sup class="powered">Powered</sup><span class="health">Health</span></div><h1>My health tracking records</h1><div class="subtitle">Pain intensity · ${escapeHtml(areaLabel)} · All matching assessments</div><div class="summary"><strong>Latest ${metric.toLowerCase()}: ${chart.at(-1) ?? '—'}/10</strong><br>Tracking overview generated from your M Powered Health records.</div><section class="chart-card"><div class="chart-title">${metric} pain intensity</div><div class="chart-caption">Assessment score from 0 to 10</div>${chartSvg}</section><h2>Recorded assessments</h2><table><thead><tr><th>Recorded</th><th>Average</th><th>Worst</th><th>Mildest</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">Generated by M Powered Health · For personal health tracking only.</div></main></body></html>`;
}
