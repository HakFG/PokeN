import HeaderClient from './HeaderClient';
import { prisma } from '@/lib/prisma';

interface Props {
  avatarUrl?: string;
}

export default async function Header({ avatarUrl }: Props) {
  const profile = await prisma.profile.findFirst({
    select: { characterSpriteUrl: true },
  });

  return <HeaderClient avatarUrl={avatarUrl || profile?.characterSpriteUrl || null} />;
}