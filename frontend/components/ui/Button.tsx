import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

/**
 * Shared button wrapper for consistent styling and accessibility.
 * Visual styling is defined in `frontend/src/index.css` via `.btn-*` classes.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={clsx(
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'ghost' && 'btn-ghost',
        className,
      )}
      {...props}
    />
  );
};

