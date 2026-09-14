'use client';

import dynamic from 'next/dynamic';

const JogosBackground = dynamic(() => import('./JogosBackground'), {
  ssr: false,
  loading: () => <div className="jogos-bg jogos-bg-loading" aria-hidden="true" />,
});

export default function JogosBackgroundLoader() {
  return <JogosBackground />;
}
