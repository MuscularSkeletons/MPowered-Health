/** Print-only styles kept separate so the report builder remains focused on health-record data. */
export const HEALTH_RECORD_REPORT_STYLES = `
  @page{size:A4 portrait;margin:14mm}
  *{box-sizing:border-box}
  html,body{width:100%;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1E3038;font-size:13px;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .report{width:100%}
  .brand{border-bottom:3px solid #CCCDF1;padding-bottom:12px;white-space:nowrap}
  .m{font-size:36px;font-weight:900}.powered{font-size:14px;font-weight:800;vertical-align:top}.health{font-size:27px;font-weight:900;color:#9B91D3;margin-left:8px}
  h1{font-size:25px;line-height:1.2;margin:22px 0 5px}.subtitle{color:#68787E;margin-bottom:18px}
  .summary{background:#D1E6ED;border:1px solid #DCE3E5;border-radius:14px;padding:15px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
  .summary strong{color:#004C62;font-size:18px}
  .chart-card{border:1px solid #DCE3E5;border-radius:14px;padding:13px 14px 8px;margin-bottom:18px;break-inside:avoid;page-break-inside:avoid}
  .chart-title{font-size:16px;font-weight:800;margin-bottom:2px}.chart-caption{font-size:11px;color:#68787E;margin-bottom:5px}.chart-card svg{display:block;width:100%;height:auto;max-height:205px}
  h2{font-size:16px;margin:0 0 9px;break-after:avoid;page-break-after:avoid}
  table{width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #DCE3E5}
  thead{display:table-header-group}tfoot{display:table-footer-group}
  tr{break-inside:avoid;page-break-inside:avoid}
  th{background:#CCCDF1;color:#1E3038;text-align:left;padding:10px;border:1px solid #CCCDF1}
  td{padding:9px 10px;border:1px solid #DCE3E5;word-wrap:break-word}
  th:first-child,td:first-child{width:40%}tr:nth-child(even) td{background:#E9F2F4}
  .footer{margin-top:18px;padding-top:10px;border-top:1px solid #DCE3E5;color:#68787E;font-size:10px;break-inside:avoid;page-break-inside:avoid}
`;
