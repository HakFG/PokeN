interface Props {
  trainerIdCode: string | null;
}

export default function TrainerIdBadge({ trainerIdCode }: Props) {
  if (!trainerIdCode) return null;
  return (
    <span className="trainer-id-badge">
      <span className="trainer-id-badge-label">ID No.</span>
      <span className="trainer-id-badge-value">{trainerIdCode}</span>
    </span>
  );
}
