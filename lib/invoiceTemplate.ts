export interface InvoiceItem {
  description: string;
  unit: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  billToName: string;
  billToAddress: string;
  billToVAT?: string;
  date: string;
  dueDate: string;
  terms: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
  notes?: string;
}

export function generateInvoiceHtml(data: InvoiceData): string {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF', minimumFractionDigits: 0 }).format(amount);
  };

  const itemsHtml = data.items.map((item, index) => `
    <tr class="item-row">
      <td class="col-id">${index + 1}</td>
      <td class="col-desc">${item.description}</td>
      <td class="col-amount">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Facture #${data.invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #333333;
          -webkit-font-smoothing: antialiased;
        }

        .invoice-container {
          padding: 60px 80px;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Header / Logo section */
        .logo-box {
          width: 48px;
          height: 48px;
          background-color: #0A346E;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .company-info {
          font-size: 11px;
          color: #555555;
          line-height: 1.5;
          margin-bottom: 60px;
        }

        .company-info strong {
          font-weight: 600;
          color: #111;
        }

        /* Invoice Title */
        .invoice-title {
          font-size: 28px;
          font-weight: 700;
          color: #0A346E;
          margin: 0 0 40px 0;
        }

        /* Meta Grid */
        .meta-grid {
          display: flex;
          gap: 60px;
          margin-bottom: 40px;
        }

        .meta-block h4 {
          font-size: 9px;
          text-transform: uppercase;
          color: #999999;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
        }

        .meta-block p {
          margin: 0;
          font-size: 12px;
          color: #333333;
          line-height: 1.5;
        }

        /* Table */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th {
          font-size: 9px;
          text-transform: uppercase;
          color: #999999;
          letter-spacing: 1px;
          text-align: left;
          padding-bottom: 12px;
          border-bottom: 1px solid #eeeeee;
          font-weight: 600;
        }

        td {
          padding: 16px 0;
          font-size: 12px;
          color: #333333;
          border-bottom: 1px solid #eeeeee;
        }

        th.col-id, td.col-id { width: 10%; }
        th.col-desc, td.col-desc { width: 60%; font-weight: 500; }
        th.col-amount, td.col-amount { width: 30%; text-align: right; font-weight: 600; }

        /* Footer / Totals */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 40px;
        }

        .notes {
          width: 50%;
        }

        .notes h4 {
          font-size: 9px;
          text-transform: uppercase;
          color: #999999;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
        }

        .notes p {
          margin: 0 0 20px 0;
          font-size: 11px;
          color: #666666;
          line-height: 1.6;
        }

        .totals {
          width: 35%;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #666666;
        }

        .totals-row.total-final {
          border-top: 1px solid #eeeeee;
          padding-top: 20px;
          margin-top: 8px;
          font-size: 14px;
          color: #0A346E;
          font-weight: 700;
          align-items: center;
        }

        .totals-row.total-final span:last-child {
          font-size: 18px;
          font-weight: 800;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAAB//8AAKACAAQAAAABAAABpqADAAQAAAABAAABWgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+ICKElDQ19QUk9GSUxFAAEBAAACGGFwcGwEAAAAbW50clJHQiBYWVogB+YAAQABAAAAAAAAYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKZGVzYwAAAPwAAAAwY3BydAAAASwAAABQd3RwdAAAAXwAAAAUclhZWgAAAZAAAAAUZ1hZWgAAAaQAAAAUYlhZWgAAAbgAAAAUclRSQwAAAcwAAAAgY2hhZAAAAewAAAAsYlRSQwAAAcwAAAAgZ1RSQwAAAcwAAAAgbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABEAGkAcwBwAGwAYQB5ACAAUAAzbWx1YwAAAAAAAAABAAAADGVuVVMAAAA0AAAAHABDAG8AcAB5AHIAaQBnAGgAdAAgAEEAcABwAGwAZQAgAEkAbgBjAC4ALAAgADIAMAAyADJYWVogAAAAAAAA9tUAAQAAAADTLFhZWiAAAAAAAACD3wAAPb////+7WFlaIAAAAAAAAEq/AACxNwAACrlYWVogAAAAAAAAKDgAABELAADIuXBhcmEAAAAAAAMAAAACZmYAAPKnAAANWQAAE9AAAApbc2YzMgAAAAAAAQxCAAAF3v//8yYAAAeTAAD9kP//+6L///2jAAAD3AAAwG7/wgARCAFaAaYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAwIEAQUABgcICQoL/8QAwxAAAQMDAgQDBAYEBwYECAZzAQIAAxEEEiEFMRMiEAZBUTIUYXEjB4EgkUIVoVIzsSRiMBbBctFDkjSCCOFTQCVjFzXwk3OiUESyg/EmVDZklHTCYNKEoxhw4idFN2WzVXWklcOF8tNGdoDjR1ZmtAkKGRooKSo4OTpISUpXWFlaZ2hpand4eXqGh4iJipCWl5iZmqClpqeoqaqwtba3uLm6wMTFxsfIycrQ1NXW19jZ2uDk5ebn6Onq8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAABAgADBAUGBwgJCgv/xADDEQACAgEDAwMCAwUCBQIEBIcBAAIRAxASIQQgMUETBTAiMlEUQAYzI2FCFXFSNIFQJJGhQ7EWB2I1U/DRJWDBROFy8ReCYzZwJkVUkiei0ggJChgZGigpKjc4OTpGR0hJSlVWV1hZWmRlZmdoaWpzdHV2d3h5eoCDhIWGh4iJipCTlJWWl5iZmqCjpKWmp6ipqrCys7S1tre4ubrAwsPExcbHyMnK0NPU1dbX2Nna4OLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwQDAwMEBgQEBAQGBwYGBgYGBwgHBwcHBwcICAgICAgICAoKCgoKCgwMDAwMDQ0NDQ0NDQ0NDf/bAEMBAgICAwMDBgMDBg4JCAkODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODv/aAAwDAQACEQMRAAAB+7ttW21bbVttW21bbVttW21bbVttW21bbVttDaufsitsum21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbC2jyzfm9N8H8S5X6r5193PnKfd8r7n6/8AOv3f5T6H6e1XafPe5tsH22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbVclnyPiHhX0PheleYzvr/nttuzDbaspMitvo35cjye39ES/Dn098d9N6Lkq8r09ti221bbVttW21bbVttW21bbVttW21bbVttW21bbVttW2SAoXm/wAz+v5fuPzlVK+v+ZRtPrcemErLP6b9LeB6vzJ51+hVB5Ho/BE+y+NfWeBtt28+mJS9e+lPg13876/6Ez84fQPyf0r7bcnZttW21bbVttW21bbVttW21bbVttW21bbVtsBoq/nPt4/c/mvy8f13zW0T73laYlhou/ovyu3wv6Z9GL8d9LE7eZ6u2wKOI7mdMPjDzX9F/JfpvA+RJ6LnPq/Bnbb568o5xf6s9m/OzuflPd+3dwPe/MfQzts99tq22rbattq22rbattq22rbYW0+Va5eneG+G8j9X83aVio+n8PTE6pGj1zg38s969u6X5P6Ni/28D29o58N0Hn3yv8t+wn1H9L/l+rvH7I74E+0PBfrNtzMz8E+h46eT8+GX3z83/XfM+K4g/ofJ22cK9e8gRw9H3v0P54/SPx/0vvuSrwPb22a22rbattq22rbattq22oP5O/rL+P8A7nL6Vf8AgvU/YfO+qTU9l0eVRdr757F8r7PA+gzvmPodoSmy2nhvxH3r9UfHFHvoc9tu4bbNa0q5Q/Z/1n+PnW+Kf1n3zX9I+DqvbY3EfMn2kP1PM/O6frv5u+v+a5KGHnnpJ3Fl4X6n5P0X6gTE/AeztsTttW21bbVttW21bbVttQvx9/YH8ffezZxO+hzX+rf5Q/q34R7nbfOb6YgXlfxL6d8n/Q5o23vptsw22rbattq22FvXvIFcx/T31X4K+8vk9ibblOor2lZPyLBlfd4R6J533uTfqtMT8PvttHbattq22rbattq22rbam/4/fsF+P3u5s9t9FnH6t/lJ+rPg6d5tvntNm7gjeUer4n8wvJ/2R+cvcz/PzdjxntorRO422raE0uOm+y+F/lr7l9dP8zpExPGdDV3DUl3RtfkKrb7vHd1wva5D9XpSr4fo22rbattq22rbattq22rbaAPx9/YL8ffcRptvpM0fqz+U36r+C/oG2+c1+aaG98A+z+R+8+i/PL3vyvT+k8ye+F67D5W+uI1b8hqX9bfiv6FfmXH+h+9fBPrf6b7D55qm1mPLac2+f+nm9t+bvIGf1nznuX1P8t/Ufzvtaku6LzvT/ImJj7vHdhx/VZD9att8P0bbVttW21bbVttW21bbVttAH4/fsD+P3uozmJ+izH+rH5T/AKr+G/oETHzenzL4F774H+gfFxM71/Ou/pf5K3l9/wCiyvib6b+Q+k7/AEbzfRqrWYDTG4x8uy8p8H82+i8HqeX0/U+DtMdGXt/1P8r/AFV+ffYxRXtF5vqfkTG33WO6Dn7rMfrzMT8R0bbLbbVttW21bbVttW21bbQb/j9+wP4++6jWYn6LMf6r/lR+q/h6egRMfNv8y+B++eB/oHxc7b2fO22ElWTmfYvrP86/0P8Ai/qHCFi+f9n5d8SM2/RPh4md6XLts9kqTH276q+Vvqr88+xiivaLzfT/ACI233WOtKuwQfsHKVfCdG2xttq22rbattq22rbattqb/j3+wn4/+5mzmJ+jzH+q/wCVH6s+Hp30THzmnzN4J734H9/8Ttt7Pn7bVtoBj9D/AM8f0O+R+icoWP5f3/z4ZvWX6b8FO26sttqyVJB9w+qPlX6q/PfsNQ31F5vqfkPMT91jnrJ2g/YdSF/C9G21bbVttW21bbVttW21bbU3/H39g/x991GkxP0WMfqt+VX6p+Dr6BE753T5l8E+qPlX7r4yclXv+ZttWiYUz+hn55foZ8n9A7Qsfy30P58NHLb9O+C226ctthaJQp9t+rPnP6M/PPsdRXtH5/p/kItKvvMs4blzX9jFiL8N0bbC22rbattq22rbattq22oX49/sJ+PvuIy230mSf1V/Kn9BfDf6S0T85onz70PPj8PcR+injX03z/ylr6h+n8TRtskfod+eH6IfJfRORkH8t7/56tnLb9O+BnRts5iz+hvO7PDPpL1g/wAf9KhejyvUmju/E9R+aykL+6yxRLzH7EuGbz4bo22FttW21bbVttW21bbVttAX4+/sJ+SPtJzmifps9tlvoX7f/Jt/5D/sJPyV9V/O6OttjM/nz6Pjr5fzxB93/LP1vzHmn6H/AJ4/ob5/e6GQfzPv/nu1J2P6J8RxvuXt3Y/Ne5WWkx8/7c7DnXzPg3xB6i/RHzMPfRZRO3RZY3eV+u9mye/DdG21bbVttW21bbVttW21bbVuV6rG+BPmf9kvL/Xz/LpXsXjf0Cq0T0LvQfPthfox75+NftvhafpPvN/R/EedEreX+lG2mOGTZ6+Qetk2ue2jLaZ4X4j7B9WfEnl++izGud6K6YiEp7/7g81vlb7j73fO6xO3Kdtq22rbattq22rbattq22rbattqH89/RG1vyc439hvkz28/i3WlX7abbaA3018vxxt+uPSfkJ9i/P6fW2ZvPNbbZbZt8u9A+jfjz5roPezeM5j189tnM5X1Dx3zt9jfSHR/PatnUbzW22jttW21bbVttW21bbVttW21bbVttW21bbVtsBzPxd97x0D8cRfqP8P/AEGXjGjesNpxu4+1/wA8I4H/AGS8P+D+N88+i+cq3tpE7ajaO1zPFe1fU/0D4DeaenbeLptsp22rbattq22rbattq22rbattq22rbattq22rbattq22rJVhfPvxH+rzH0E/HjfXnyd9EjXbd67bVtoW1r6396+O/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" class="logo-box" style="background: none; width: auto; height: 50px; border-radius: 0;" alt="CFIG Logo" />
        
        <div class="company-info">
          <strong>CFIG Guinée</strong><br>
          Quartier Kipé, Commune de Ratoma<br>
          Conakry, République de Guinée<br>
          Tel: +224 626 62 51 62
        </div>

        <h1 class="invoice-title">Facture #${data.invoiceNumber}</h1>

        <div class="meta-grid">
          <div class="meta-block" style="flex: 2;">
            <h4>Facturé à</h4>
            <p>
              <strong>${data.billToName}</strong><br>
              ${data.billToAddress ? data.billToAddress.replace(/\n/g, '<br>') : ''}<br>
              ${data.billToVAT ? `NIF: ${data.billToVAT}` : ''}
            </p>
          </div>
          <div class="meta-block" style="flex: 1;">
            <h4>Date</h4>
            <p>${data.date}</p>
          </div>
          <div class="meta-block" style="flex: 1;">
            <h4>Échéance</h4>
            <p>${data.dueDate}</p>
          </div>
          <div class="meta-block" style="flex: 1;">
            <h4>Conditions</h4>
            <p>${data.terms}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-id">#</th>
              <th class="col-desc">DESCRIPTION DE LA FORMATION</th>
              <th class="col-amount">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="footer">  
          <div class="notes">
            <h4>Notes</h4>
            <p>${data.notes || "Le règlement de cette facture a été effectué par paiement électronique sécurisé (Mobile Money ou Carte Visa)."}</p>
            <p>Merci pour votre confiance !</p>
          </div>
          
          <div class="totals">
            <div class="totals-row">
              <span>SOUS-TOTAL</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
            ${data.discountPct > 0 ? `
            <div class="totals-row">
              <span>REMISE (${data.discountPct}%)</span>
              <span>-${formatCurrency(data.discountAmount)}</span>
            </div>
            ` : ''}
            <div class="totals-row total-final">
              <span>TOTAL</span>
              <span>${formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}
