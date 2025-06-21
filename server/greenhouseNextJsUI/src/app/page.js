import LandingPage from './home/page';
import Script from 'next/script';

export default function Page() {
  return (
    <>
      <LandingPage />;
      <Script src="./aichat.js" />
    </>
  );
}
