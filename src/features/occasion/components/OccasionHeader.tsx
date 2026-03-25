import type { Occasion } from '../../../types/models';

interface OccasionHeaderProps {
  occasion: Occasion;
}

export function OccasionHeader({ occasion }: OccasionHeaderProps) {
  return (
    <section className="occasion-title">
      <h2>{occasion.title}</h2>
    </section>
  );
}
