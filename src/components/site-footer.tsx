export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-amber-500/20 py-6 text-center text-sm text-stone-400">
      © 2026 CRENIX Technology. All rights reserved.
    </footer>
  );
}

/** Soft gold glow behind every page */
export function PageGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute top-40 -left-40 h-[500px] w-[700px] rounded-full bg-amber-600/15 blur-3xl" />
      <div className="absolute top-10 right-0 h-[500px] w-[600px] rounded-full bg-orange-500/15 blur-3xl" />
    </div>
  );
}
