type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Kept for backward-compat with callers; no longer used. */
  delay?: number;
};

/**
 * Used to be a Framer Motion `whileInView` reveal — now a plain server
 * component. Decorative entrance animations were removed: they delayed
 * content visibility, shipped Framer Motion JS for no functional value,
 * and made the page feel slower than it is.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}
