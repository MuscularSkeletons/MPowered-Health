/** Styles for health profile report PDF */
export const HEALTH_PROFILE_REPORT_STYLES = `
    @page {
        size: A4;
        margin: 16mm;
    }

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        color: #1E3038;
        font: 12pt/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow-wrap: anywhere;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .brand {
        border-bottom: 3px solid #CCCDF1;
        padding-bottom: 12px;
        white-space: nowrap;
    }

    .m {
        font-size: 36px;
        font-weight: 900;
    }

    .powered {
        font-size: 14px;
        font-weight: 800;
        vertical-align: top;
    }

    .health {
        font-size: 27px;
        font-weight: 900;
        color: #9B91D3;
        margin-left: 8px;
    }

    h1 {
        font-size: 25px;
        line-height: 1.2;
        margin: 22px 0 4px;
    }

    .intro {
        color: #68787E;
        margin: 0 0 18px;
    }

    .meta {
        display: inline-block;
        background: #E9E8F5;
        color: #1E3038;
        border-radius: 999px;
        padding:5px 10px;
        font-size: 10pt;
        font-weight: 700;
        margin-bottom: 8px;
    }

    section {
        margin-top: 14px;
        padding: 14px;
        border: 1px solid #CCCDF1;
        border-radius: 14px;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    h2 {
        margin: 0 0 10px;
        color: #1E3038;
        font-size: 16pt;
        border-bottom: 1px solid #CCCDF1;
        padding-bottom: 8px;
    }

    .row {
        margin-bottom: 9px;
        break-inside: avoid;
    }

    .row:last-child {
        margin-bottom: 0;
    }

    dt {
        color: #68787E;
        font-size: 9pt;
        font-weight: 700;
    }

    dd {
        margin: 1px 0 0;
        white-space: pre-wrap;
    }

    .footer {
        margin-top: 18px;
        padding-top: 10px;
        border-top: 1px solid #CCCDF1;
        color: #68787E;
        font-size: 9pt;
    }
`;