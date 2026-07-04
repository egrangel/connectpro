interface StarRatingProps {
  value: number;
  size?: "sm" | "md";
}

/** Read-only star display (filled by fraction of `value` out of 5). */
export function StarRating({ value, size = "sm" }: StarRatingProps) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={dimension}
          fill={star <= Math.round(value) ? "var(--color-accent)" : "#d7dbe0"}
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
