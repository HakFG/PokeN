import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import InfoCard from '@/components/HackRoom/InfoCard';
import ScreenshotGallery from '@/components/HackRoom/ScreenshotGallery';
import { prisma } from '@/lib/prisma';

export default async function HackRoomPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await prisma.game.findUnique({ where: { id: gameId }, include: { hackRoom: { include: { screenshots: { orderBy: { createdAt: 'desc' } }, fakeSpecies: true, pokedexEntries: true, gymLeaders: true } } } });
  if (!game || game.type !== 'HACK_ROM' || !game.hackRoom) notFound();
  const { hackRoom } = game;
  return <div className="min-h-screen bg-[#080d1a] text-white"><Header /><main className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10"><Link href={`/jogos/${gameId}`} className="text-xs font-bold uppercase tracking-wider text-cyan-200/70 hover:text-cyan-100">← Qual modo</Link><header className="mb-8 mt-4 border-l-2 border-amber-300 pl-4"><p className="font-display text-[10px] font-bold uppercase tracking-[.28em] text-amber-200">Hackroom</p><h1 className="mt-1 text-3xl font-black md:text-5xl">{game.name}</h1></header><div className="grid gap-5 lg:grid-cols-[1.45fr_.8fr]"><InfoCard gameId={gameId} status={game.status} description={hackRoom.description} baseRomName={hackRoom.baseRomName} regionName={hackRoom.regionName} difficulty={hackRoom.difficulty} /><aside className="grid content-start gap-3"><HubLink href={`/jogos/${gameId}/hackroom/pokedex`} label="Pokédex" value={hackRoom.pokedexEntries.length} detail="Espécies da região" /><HubLink href={`/jogos/${gameId}/hackroom/fakemon`} label="Fakémon" value={hackRoom.fakeSpecies.length} detail="Espécies criadas" /><HubLink href={`/jogos/${gameId}/hackroom/lideres`} label="Líderes" value={hackRoom.gymLeaders.length} detail="Chefes cadastrados" /><HubLink href={`/jogos/${gameId}/living-dex`} label="Living Dex" value="→" detail="Abrir coleção" /></aside></div><div className="mt-5"><ScreenshotGallery gameId={gameId} screenshots={hackRoom.screenshots} /></div></main></div>;
}
function HubLink({ href, label, value, detail }: { href: string; label: string; value: number | string; detail: string }) { return <Link href={href} className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/10 to-transparent p-4 transition hover:-translate-y-0.5 hover:border-amber-300/50"><span className="text-2xl font-black text-amber-200">{value}</span><span className="ml-2 font-display text-xs font-bold uppercase tracking-wider">{label}</span><p className="mt-1 text-xs text-white/45">{detail}</p></Link>; }
