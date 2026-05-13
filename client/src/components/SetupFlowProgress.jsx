const STEPS = [
  { id: 1, label: "Fuel", sub: "Calorie target" },
  { id: 2, label: "Train", sub: "Workout plan" },
  { id: 3, label: "Ready", sub: "You’re set" },
];

export function SetupFlowProgress({ activeStep }) {
  const step = Math.min(Math.max(activeStep, 1), 3);

  return (
    <div className="mb-8 rounded-3xl border border-gray-100 bg-white/80 px-3 py-4 sm:px-4 sm:py-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm overflow-x-auto">
      <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[#EF4444] mb-3 sm:mb-4">
        Your setup
      </p>
      <div className="flex min-w-[280px] items-center justify-center max-w-lg mx-auto">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const current = step === s.id;
          const segmentFilled = i > 0 && step > STEPS[i - 1].id;

          return (
            <div key={s.id} className="contents">
              {i > 0 && (
                <div
                  className={`mx-1 h-0.5 min-w-[12px] flex-1 rounded-full transition-colors duration-500 ${
                    segmentFilled ? "bg-[#EF4444]" : "bg-gray-200"
                  }`}
                  aria-hidden
                />
              )}
              <div className="flex flex-col items-center w-[72px] sm:w-[88px] shrink-0">
                <div
                  className={`flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
                    done
                      ? "bg-[#EF4444] text-white shadow-[0_4px_14px_rgba(239,68,68,0.45)]"
                      : current
                        ? "bg-[#FEF2F2] text-[#EF4444] ring-2 ring-[#EF4444]/40 scale-110"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-lg leading-none">check</span>
                  ) : (
                    s.id
                  )}
                </div>
                <p
                  className={`mt-2 text-center text-[11px] sm:text-xs font-bold leading-tight ${
                    current ? "text-[#111]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </p>
                <p className="hidden sm:block text-center text-[10px] font-medium text-gray-400 leading-tight mt-0.5 px-1">
                  {s.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SetupTransitionOverlay({ message }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]/55 px-6 backdrop-blur-md ff-setup-overlay-enter"
      role="status"
      aria-live="polite"
    >
      <div className="mb-6 relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#EF4444] animate-spin" />
      </div>
      <p className="text-center font-['Plus_Jakarta_Sans'] text-xl font-black text-white tracking-tight">
        {message}
      </p>
      <p className="mt-2 text-center text-sm font-medium text-white/75 max-w-xs">
        Hang tight — almost there.
      </p>
    </div>
  );
}
