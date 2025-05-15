'use client';

import { Content, Theme } from '@carbon/react';

import GreenhouseHeader from '@/components/GreenhouseHeader/GreenhouseHeader';

export function Providers({ children }) {
  return (
    <div>
      <Theme theme="g100">
        <GreenhouseHeader />
      </Theme>
      <Content>{children}</Content>
    </div>
  );
}
