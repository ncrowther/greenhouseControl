import './globals.scss';

import { Providers } from './providers';

export const metadata = {
  title: 'Greenhouse',
  description: 'Greenhouse Controller',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
