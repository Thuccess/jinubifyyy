'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await clientAPI.getPayments();
      setInvoices(data.invoices || []);
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payments &amp; Invoices</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review your billing history, invoice status, and payment activity.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-2 pr-4">Invoice ID</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-text-secondary">
                    You don&apos;t have any invoices yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border-subtle/60 last:border-0">
                    <td className="py-2 pr-4 text-xs text-text-secondary">{inv.id}</td>
                    <td className="py-2 pr-4 font-medium text-text-primary">
                      ${inv.amount?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-surface-muted text-text-secondary">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-text-muted">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

