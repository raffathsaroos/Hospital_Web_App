const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const money = (value) => `LKR ${Number(value ?? 0).toLocaleString()}`;

// Downloads a self-contained branded bill without creating a separate bill page.
export function downloadHospitalBill({
  title,
  billNumber,
  patientName,
  meta = [],
  lineItems = [],
  total = 0,
}) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; background: #f1f5f9; color: #0f172a; font-family: Arial, sans-serif; }
    .bill { max-width: 760px; margin: 32px auto; background: white; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden; }
    .header { display: flex; justify-content: space-between; gap: 24px; padding: 28px; background: linear-gradient(135deg, #1d4ed8, #1e293b); color: white; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 48px; height: 48px; border-radius: 12px; background: #dbeafe; display: grid; place-items: center; }
    .logo svg { width: 30px; height: 30px; color: #1d4ed8; }
    h1, h2, p { margin: 0; }
    .subtitle { margin-top: 5px; color: #bfdbfe; font-size: 13px; }
    .content { padding: 28px; }
    .patient { padding: 16px; border-radius: 10px; background: #eff6ff; border: 1px solid #bfdbfe; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 22px 0; }
    .meta div { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    .value { margin-top: 4px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; }
    th:last-child, td:last-child { text-align: right; }
    .total { display: flex; justify-content: space-between; margin-top: 20px; padding: 18px; border-radius: 10px; background: #1d4ed8; color: white; font-size: 20px; font-weight: 700; }
    .footer { padding: 18px 28px; background: #f8fafc; color: #64748b; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <main class="bill">
    <header class="header">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
          </svg>
        </div>
        <div><h1>New Hospital</h1><p class="subtitle">Trusted hospital care</p></div>
      </div>
      <div><h2>${escapeHtml(title)}</h2><p class="subtitle">Bill #${escapeHtml(billNumber)}</p></div>
    </header>
    <section class="content">
      <div class="patient"><span class="label">Patient</span><p class="value">${escapeHtml(patientName)}</p></div>
      <div class="meta">${meta
        .map(
          (item) =>
            `<div><span class="label">${escapeHtml(item.label)}</span><p class="value">${escapeHtml(item.value)}</p></div>`,
        )
        .join("")}</div>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>${lineItems
          .map(
            (item) =>
              `<tr><td>${escapeHtml(item.description)}</td><td>${money(item.amount)}</td></tr>`,
          )
          .join("")}</tbody>
      </table>
      <div class="total"><span>Total</span><span>${money(total)}</span></div>
    </section>
    <footer class="footer">Thank you for choosing New Hospital.</footer>
  </main>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${billNumber}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
