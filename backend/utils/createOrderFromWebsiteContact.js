import Order from '../models/Order.js';

function parseWebsiteOrderSubject(subject) {
  const s = String(subject || '').trim();
  const withSlug = s.match(/^Order website:\s*(.+)\s*\[([^\]]+)\]\s*$/i);
  if (withSlug) {
    return { title: withSlug[1].trim(), slug: withSlug[2].trim() };
  }
  const titleOnly = s.match(/^Order website:\s*(.+)$/i);
  if (titleOnly) {
    return { title: titleOnly[1].trim(), slug: 'website-demo' };
  }
  return null;
}

function extractPhoneFromMessage(message) {
  const m = String(message || '').match(/Phone:\s*([^\n\r]+)/i);
  return m ? m[1].trim() : '';
}

/**
 * When a contact submission is a website template order (same subject as Get This Website modal),
 * create an Order so it appears in Admin → Orders Management alongside checkout orders.
 */
export async function createOrderFromWebsiteContact(contactDoc) {
  const parsed = parseWebsiteOrderSubject(contactDoc.subject);
  if (!parsed) return null;

  const phone = extractPhoneFromMessage(contactDoc.message);
  const now = new Date();

  const order = new Order({
    customer: {
      name: contactDoc.name,
      email: contactDoc.email,
      phone,
      country: '—',
      city: '',
      company: '',
      industry: '',
      notes: `Contact submission ${contactDoc._id}\n\n${contactDoc.message}`,
    },
    order: {
      service: parsed.title,
      serviceSlug: parsed.slug,
      packageName: 'Website template (email/contact)',
      price: 0,
      currency: 'USD',
      pricingCategory: 'website-demo',
      sourcePage: 'website-demo-contact',
      status: 'pending',
      orderTimestamp: now,
    },
    serviceName: parsed.title,
    quantity: 1,
    price: 0,
    status: 'pending',
    adminNotes: `Created from contact form. Contact ID: ${contactDoc._id}`,
  });

  await order.save();
  return order;
}
