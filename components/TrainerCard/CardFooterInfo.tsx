interface Props {
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  playtime: string | null;
}

function formatDate(value: Date | string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function CardFooterInfo({
  startedAt,
  completedAt,
  playtime,
}: Props) {
  return (
    <div className="trainer-card-footer-info">
      <span className="trainer-card-footer-item">
        <span className="trainer-card-footer-label">Início</span>
        <span className="trainer-card-footer-value">
          {formatDate(startedAt)}
        </span>
      </span>
      <span className="trainer-card-footer-item">
        <span className="trainer-card-footer-label">Zerado</span>
        <span className="trainer-card-footer-value">
          {formatDate(completedAt)}
        </span>
      </span>
      <span className="trainer-card-footer-item">
        <span className="trainer-card-footer-label">Playtime</span>
        <span className="trainer-card-footer-value">
          {playtime ?? '—'}
        </span>
      </span>
    </div>
  );
}
