'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { classNames } from '@/utils/classNames';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2-5 py-0-5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-bolt-elements-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-bolt-elements-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background/80',
        secondary:
          'border-transparent bg-bolt-elements-background text-bolt-elements-textSecondary hover:bg-bolt-elements-background/80',
        destructive: 'border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20',
        outline: 'text-bolt-elements-textPrimary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={classNames(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
