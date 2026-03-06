'use client';

import React from 'react';

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full">{children}</table>
  </div>
);

interface AdminTableHeaderProps {
  children: React.ReactNode;
}

export const AdminTableHeader: React.FC<AdminTableHeaderProps> = ({ children }) => (
  <thead>
    <tr className="border-b border-border-subtle bg-[color:var(--surface-muted)]/60">{children}</tr>
  </thead>
);

interface AdminTableHeadCellProps {
  children?: React.ReactNode;
  className?: string;
  hidden?: boolean;
}

export const AdminTableHeadCell: React.FC<AdminTableHeadCellProps> = ({
  children,
  className = '',
  hidden,
}) => (
  <th
    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted ${hidden ? 'hidden md:table-cell' : ''} ${className}`}
  >
    {children}
  </th>
);

interface AdminTableBodyProps {
  children: React.ReactNode;
}

export const AdminTableBody: React.FC<AdminTableBodyProps> = ({ children }) => (
  <tbody className="divide-y divide-border-subtle">{children}</tbody>
);

interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AdminTableRow: React.FC<AdminTableRowProps> = ({ children, className = '', onClick }) => (
  <tr
    className={`hover:bg-[color:var(--surface-muted)]/40 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

interface AdminTableCellProps {
  children?: React.ReactNode;
  className?: string;
  hidden?: boolean;
}

export const AdminTableCell: React.FC<AdminTableCellProps> = ({
  children,
  className = '',
  hidden,
}) => (
  <td
    className={`px-5 py-3.5 text-sm text-text-primary ${hidden ? 'hidden md:table-cell' : ''} ${className}`}
  >
    {children}
  </td>
);
