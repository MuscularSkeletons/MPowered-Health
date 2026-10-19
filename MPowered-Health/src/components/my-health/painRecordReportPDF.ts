/** Builds the printable health-record report, including its chart. */
import {
  PainAssessmentRecord,
  PainMetric,
  painMetricValue,
  painRecordDate,
} from '@/services/healthRecords.store';
import { PAIN_RECORD_REPORT_STYLES } from '@/constants/myhealth/painRecordStyles';

/**
 * Escapes special characters so user text is safe to place in an HTML report.
 *
 * User-entered labels must be escaped before they are inserted into the print document.
 */
const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (value) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!,
  );

/** Builds a printable HTML report from the health records. */
export function buildPainRecordsHtml(
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

  /**
   * Places a record along the report chart’s horizontal axis.
   *
   * Spread points across the available width, centring a chart with one result.
   */
  const chartX = (index: number) =>
    chart.length === 1
      ? (chartLeft + chartRight) / 2
      : chartLeft + (index * (chartRight - chartLeft)) / (chart.length - 1);

  /** Places a score along the report chart’s vertical axis. */
  const chartY = (score: number) => chartBottom - (score / 10) * (chartBottom - chartTop);

  // These strings become the line and shaded area coordinates in the SVG.
  const chartPoints = chart.map((score, index) => `${chartX(index)},${chartY(score)}`).join(' ');
  const chartArea = `${chartX(0)},${chartBottom} ${chartPoints} ${chartX(chart.length - 1)},${chartBottom}`;
  const horizontalGrid = Array.from(
    // Draw one horizontal guide for every possible score from zero to ten.
    { length: 11 },
    (_, score) =>
      `<line x1="${chartLeft}" x2="${chartRight}" y1="${chartY(score)}" y2="${chartY(score)}" stroke="#CBD6D9" stroke-width="1" stroke-dasharray="3 4"/><text x="30" y="${chartY(score) + 4}" text-anchor="end" font-size="10" fill="#68787E">${score}</text>`,
  ).join('');
  
  const verticalGrid = chart
    .map(
      (_, index) =>
        `<line x1="${chartX(index)}" x2="${chartX(index)}" y1="${chartTop}" y2="${chartBottom}" stroke="#DCE3E5" stroke-width="1" stroke-dasharray="3 4"/>`,
    )
    .join('');

  const chartLabels = chartDates
    // Limit date labels on long histories so they remain readable when printed.
    .map((date, index) =>
      date && (index % Math.max(1, Math.ceil(chart.length / 8)) === 0 || index === chart.length - 1)
        ? `<text x="${chartX(index)}" y="202" text-anchor="middle" font-size="9" fill="#68787E">${date}</text>`
        : '',
    )
    .join('');

  const chartDots = chart
    .map(
      (score, index) =>
        `<circle cx="${chartX(index)}" cy="${chartY(score)}" r="4" fill="#CF5FA8"/>`,
    )
    .join('');

  const chartSvg = `
    <svg viewBox="0 0 680 215" role="img" aria-label="${metric} pain intensity chart">
      ${chart.length > 1 ? `<polygon points="${chartArea}" fill="#F0CBEA" fill-opacity="0.62"/>` : ''}
      ${horizontalGrid}
      ${verticalGrid}<polyline points="${chartPoints}" fill="none" stroke="#CF5FA8" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${chartDots}${chartLabels}
    </svg>
  `;
  
    // Return one self-contained document so native and web printing need no extra assets.
  return `
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Pain Records</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">

            <style>
                ${PAIN_RECORD_REPORT_STYLES}
            </style>
        </head>
        <body>
            <main class="report">

                <div class="brand">
                    <span class="m">M</span>
                    <sup class="powered">Powered</sup>
                    <span class="health">Health</span>
                </div>

                <h1>Pain Records</h1>
                <div class="subtitle">Pain intensity · ${escapeHtml(areaLabel)} · All matching assessments</div>
                <div class="summary">
                    <strong>Latest ${metric.toLowerCase()}: ${chart.at(-1) ?? '—'}/10</strong>
                    <br>Tracking overview generated from your MPowered Health records.
                </div>

                <section class="chart-card">
                    <div class="chart-title">${metric} pain intensity</div>
                    <div class="chart-caption">Assessment score from 0 to 10</div>
                    ${chartSvg}
                </section>

                <h2>Recorded assessments</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Recorded</th>
                            <th>Average</th>
                            <th>Worst</th>
                            <th>Mildest</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <div class="footer">Generated by MPowered Health · For personal health reference only.</div>
            </main>
        </body>
    </html>
  `;
}
