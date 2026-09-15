interface Props {
  count: number;
}

export default function ShinyCounter({ count }: Props) {
  if (count === 0) return null;
  return (
    <span className="trainer-shiny-counter">
      <span className="trainer-shiny-counter-icon" aria-hidden="true">
        ✦
      </span>
      <span className="trainer-shiny-counter-value">{count}</span>
      <span className="trainer-shiny-counter-label">
        shiny{count > 1 ? 's' : ''}
      </span>
    </span>
  );
}
