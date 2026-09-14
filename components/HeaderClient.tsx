'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { label: 'POKÉMONS', href: '/pokemons' },
  { label: 'JOGOS', href: '/jogos' },
];

interface Props {
  avatarUrl: string | null;
}

export default function HeaderClient({ avatarUrl }: Props) {
  const pathname = usePathname();
  const fallbackAvatarUrl = '/images/avatar.png';
  const [imageSrc, setImageSrc] = useState(avatarUrl || fallbackAvatarUrl);
  const [avatarFailed, setAvatarFailed] = useState(false);

  function handleAvatarError() {
    if (imageSrc !== fallbackAvatarUrl) {
      setImageSrc(fallbackAvatarUrl);
    } else {
      setAvatarFailed(true);
    }
  }

  return (
    <header className="site-header w-full px-4 sm:px-8 pt-5 sm:pt-8 pb-4 flex items-center justify-between gap-4">
      <Link href="/" aria-label="Ir para a página inicial">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="select-none flex items-center"
        >
          <img
            src="/images/logo.png"
            alt="PokeN"
            className="h-14 sm:h-16 md:h-20 w-auto object-contain"
          />
        </motion.div>
      </Link>

      <nav className="flex items-center gap-4 sm:gap-8" aria-label="Navegação principal">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
              <motion.span
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                className={`font-display group relative inline-block text-sm sm:text-xl md:text-2xl font-bold tracking-wide cursor-pointer transition-colors ${
                  active ? 'text-white' : 'text-amber-50/80 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 rounded-full bg-amber-300 transition-all duration-300 ${
                    active ? 'w-full shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'w-0 group-hover:w-full'
                  }`}
                />
              </motion.span>
            </Link>
          );
        })}
      </nav>

      <Link href="/perfil" aria-label="Abrir perfil">
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 overflow-hidden flex items-center justify-center select-none ring-2 ring-amber-200/50 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
        >
          {!avatarFailed ? (
            <img
              src={imageSrc}
              alt="Avatar de Hak"
              className="w-full h-full object-cover"
              onError={handleAvatarError}
            />
          ) : (
            <span className="text-sm sm:text-lg font-black tracking-wider text-amber-50">HK</span>
          )}
        </motion.div>
      </Link>
    </header>
  );
}
