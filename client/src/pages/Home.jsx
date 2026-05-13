import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] pt-4 pb-0 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 sm:pt-12 pb-0 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy */}
          <div className="space-y-5 sm:space-y-7 z-10 pb-8 lg:pb-24">
            <div className="inline-flex items-center gap-2 bg-white text-[#EF4444] font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full shadow-sm border border-[#FECACA] max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block animate-pulse shrink-0" />
              <span className="leading-snug">AI-Powered Fitness & Nutrition</span>
            </div>

            <h1 className="text-[1.65rem] leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[56px] font-black text-[#111] sm:leading-[1.07]">
              Forge Your Best Self with{" "}
              <span className="text-[#EF4444]">AI-Driven</span> Wellness
            </h1>

            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg font-medium">
              Experience the future of fitness. Our advanced AI analyzes your unique
              biomechanics and metabolic data to craft premium nutrition plans and
              precision workout routines, guiding you to unparalleled results.
            </p>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:pt-2">
              <Link
                to={user ? "/workout" : "/register"}
                className="btn-brand text-base justify-center min-h-[48px] w-full sm:w-auto"
              >
                <span className="material-symbols-outlined text-base">arrow_forward</span>
                {user ? "Go to Dashboard" : "Start Your Journey"}
              </Link>
              <Link
                to={user ? "/calculator" : "/login"}
                className="btn-dark text-base justify-center min-h-[48px] w-full sm:w-auto"
              >
                {user ? "Open Calculator" : "Explore Features"}
              </Link>
            </div>

            {/* Mobile / tablet hero visual (desktop uses column image) */}
            <div className="lg:hidden mt-2">
              <div className="relative overflow-hidden rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                <img
                  src="/hero.png"
                  alt="Athlete training in a modern gym"
                  className="w-full h-[200px] sm:h-[260px] object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent pt-16 pb-3 px-4">
                  <p className="text-white/90 text-xs font-semibold">
                    AI plans + nutrition — built for real training.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right: hero image + floating pills */}
          <div className="relative self-end hidden lg:block">
            {/* Subtle glow backdrop */}
            <div className="absolute inset-0 bg-[#EF4444]/5 rounded-[32px] translate-x-4 translate-y-4 -z-10" />

            <img
              src="/hero.png"
              alt="Athlete training in a modern gym"
              className="rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-full h-[580px] object-cover"
            />

            {/* Floating heart rate pill */}
            <div className="absolute bottom-10 left-[-24px] bg-white rounded-[20px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#EF4444]">monitor_heart</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Heart Rate</p>
                <p className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-[#111]">
                  142 <span className="text-sm font-semibold text-gray-400">bpm</span>
                </p>
              </div>
            </div>

            {/* Floating macro pill */}
            <div className="absolute top-10 right-[-24px] bg-white rounded-[20px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#6EB5FF]">local_fire_department</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Calories Burned</p>
                <p className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-[#111]">
                  487 <span className="text-sm font-semibold text-gray-400">kcal</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Feature Grid ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 sm:py-20 lg:py-32">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-20 px-1">
          <h2 className="font-black text-[1.6rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl text-[#111] mb-3 sm:mb-4">
            Precision engineering<br />for your body
          </h2>
          <p className="text-gray-500 text-base sm:text-lg font-medium leading-relaxed">
            Our modular ecosystem adapts to your lifestyle, delivering actionable
            insights when you need them most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1: AI Nutrition Hub */}
          <div className="bg-[#F7F9FC] rounded-[24px] p-8 border border-gray-100 flex flex-col min-h-[380px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] flex items-center justify-center mb-6 flex-shrink-0">
              <span className="material-symbols-outlined text-[#F59E0B] text-2xl">restaurant</span>
            </div>
            <h3 className="font-bold text-[#111] text-xl mb-3">
              AI Nutrition Hub
            </h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed flex-grow">
              Effortlessly log meals using natural language. Our AI breaks down macros,
              micros, and suggests adjustments in real-time for your goals.
            </p>
            {/* Mock input pill */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-6">
              <p className="text-xs text-gray-400 italic font-medium leading-relaxed">
                "I had a grilled chicken salad with avocado and balsamic dressing."
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-1 rounded-full">P 38g</span>
                <span className="text-xs font-bold text-[#6EB5FF] bg-[#EFF6FF] px-2 py-1 rounded-full">C 22g</span>
                <span className="text-xs font-bold text-[#F59E0B] bg-[#FFFBEB] px-2 py-1 rounded-full">F 18g</span>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">398 kcal</span>
              </div>
            </div>
          </div>

          {/* Card 2: Workout Forge — wide, red background */}
          <div className="bg-[#EF4444] rounded-[24px] p-8 md:col-span-2 flex flex-col md:flex-row gap-8 overflow-hidden relative min-h-[380px] hover:shadow-[0_8px_40px_rgba(239,68,68,0.30)] transition-shadow">
            {/* Glow blob */}
            <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="z-10 flex flex-col flex-1 justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 flex-shrink-0">
                <span className="material-symbols-outlined text-white text-2xl">fitness_center</span>
              </div>
              <h3 className="font-black text-2xl text-white mb-3">
                Workout Forge
              </h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-sm">
                Hyper-personalized routines that evolve with your progress. Avoid plateaus
                with dynamically adjusted volume and intensity, powered by Gemini AI.
              </p>
              <Link
                to={user ? "/workout" : "/register"}
                className="mt-6 sm:mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 bg-white text-[#EF4444] font-bold text-sm px-6 py-3 rounded-full w-full sm:w-fit hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              >
                Generate my plan
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>

            {/* Fake plan card */}
            <div className="flex-1 relative hidden md:flex items-center justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-[20px] p-6 border border-white/25 rotate-[-4deg] shadow-xl w-[240px]">
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">Your 5-Day Plan</p>
                {[
                  { day: "Monday", muscle: "Chest & Triceps" },
                  { day: "Tuesday", muscle: "Back & Biceps" },
                  { day: "Wednesday", muscle: "Rest Day" },
                  { day: "Thursday", muscle: "Legs & Core" },
                  { day: "Friday", muscle: "Shoulders" },
                ].map((d, i) => (
                  <div key={i} className={`flex justify-between items-center py-2 ${i < 4 ? "border-b border-white/10" : ""}`}>
                    <span className="text-white font-bold text-xs">{d.day}</span>
                    <span className="text-white/60 text-[10px] font-medium">{d.muscle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Calorie Calculator — tall left */}
          <div className="bg-[#F7F9FC] rounded-[24px] p-8 border border-gray-100 flex flex-col min-h-[340px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-6 flex-shrink-0">
              <span className="material-symbols-outlined text-[#6EB5FF] text-2xl">calculate</span>
            </div>
            <h3 className="font-bold text-[#111] text-xl mb-3">
              Calorie Calculator
            </h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed flex-grow">
              Get your precise BMR, TDEE, and daily macro targets using
              scientifically backed formulas tailored to your body and goals.
            </p>
            {/* Mock stat chips */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { label: "BMR", value: "1,820", color: "bg-[#FEF2F2] text-[#EF4444]" },
                { label: "TDEE", value: "2,460", color: "bg-[#EFF6FF] text-[#6EB5FF]" },
                { label: "Target", value: "1,960", color: "bg-[#FFFBEB] text-[#F59E0B]" },
              ].map((s) => (
                <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</p>
                  <p className="font-['Plus_Jakarta_Sans'] font-black text-base mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            <Link
              to={user ? "/calculator" : "/register"}
              className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[#EF4444] font-bold text-sm hover:opacity-75 transition-opacity cursor-pointer"
            >
              Calculate mine
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Card 4: Live Form Analysis — spans 2 cols */}
          <div className="md:col-span-2 bg-white rounded-[24px] border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[340px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-shadow">
            {/* Image side */}
            <div className="flex-1 relative min-h-[260px]">
              <img
                src="/form-analysis.png"
                alt="AI live form analysis"
                className="w-full h-full object-cover"
              />
              {/* AI lines overlay */}
              <svg
                className="absolute inset-0 w-full h-full text-[#EF4444] opacity-60 pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path d="M 30,75 L 50,42 L 72,62" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 1"/>
                <circle cx="30" cy="75" fill="currentColor" r="1.8"/>
                <circle cx="50" cy="42" fill="currentColor" r="1.8"/>
                <circle cx="72" cy="62" fill="currentColor" r="1.8"/>
                <path d="M 48,42 L 52,42 M 48,42 L 46,38 M 52,42 L 54,38" fill="none" stroke="currentColor" strokeWidth="0.4"/>
              </svg>
              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse inline-block"/>
                LIVE
              </div>
            </div>

            {/* Text side */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] flex items-center justify-center mb-5 flex-shrink-0">
                <span className="material-symbols-outlined text-[#EF4444] text-2xl">videocam</span>
              </div>
              <h3 className="font-black text-2xl text-[#111] mb-3">
                Live Form Analysis
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                Our computer vision technology acts as your personal spotter.
                Receive real-time feedback on your posture and range of motion to
                maximize gains and prevent injury.
              </p>
              <Link to="/vision" className="inline-flex min-h-[44px] items-center gap-2 text-[#EF4444] font-bold text-sm hover:opacity-75 transition-opacity w-fit cursor-pointer">
                See how it works
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── What's Included ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] py-20 lg:py-28 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-black text-3xl md:text-4xl text-[#111] mb-3">
              Everything you need, nothing you don't
            </h2>
            <p className="text-gray-500 font-medium text-lg">A complete toolkit for serious athletes and beginners alike.</p>
          </div>
          <div className="bg-white rounded-card shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            {[
              { feature: "AI Nutrition Logging",        free: true,  desc: "Natural language food tracking with macro breakdown" },
              { feature: "AI Workout Planner",          free: true,  desc: "Personalized multi-day routines powered by Gemini" },
              { feature: "Calorie & Macro Calculator",  free: true,  desc: "Science-based BMR, TDEE, and target calculations" },
              { feature: "Live Form Analysis",          free: true,  desc: "Computer vision rep counter for squats and push-ups" },
              { feature: "Progress Persistence",        free: true,  desc: "Saved plans and logs across sessions" },
            ].map((row, i, arr) => (
              <div
                key={i}
                className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 ${
                  i < arr.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-inner bg-brand-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-brand text-sm">check</span>
                </div>
                <div>
                  <p className="font-bold text-[#111] text-sm">{row.feature}</p>
                  <p className="text-gray-500 text-sm font-medium mt-0.5">{row.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 lg:py-28 px-4 md:px-8 text-center bg-white">
        <div className="max-w-3xl mx-auto px-1">
          <div className="inline-flex items-center gap-2 bg-[#FEF2F2] text-[#EF4444] font-semibold text-xs sm:text-sm px-4 py-2 rounded-full mb-5 sm:mb-7">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block animate-pulse" />
            Get started in minutes
          </div>
          <h2 className="font-black text-[1.75rem] sm:text-4xl md:text-5xl text-[#111] mb-4 sm:mb-5 leading-tight">
            Start your journey today.
          </h2>
          <p className="text-gray-500 text-base sm:text-lg font-medium mb-8 sm:mb-10">
            Join early adopters building smarter, stronger routines with FitForge.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md sm:max-w-none mx-auto">
            <Link to={user ? "/workout" : "/register"} className="btn-brand text-base justify-center min-h-[48px] w-full sm:w-auto">
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              {user ? "Go to Dashboard" : "Get started free"}
            </Link>
            <Link to={user ? "/calculator" : "/login"} className="btn-dark text-base justify-center min-h-[48px] w-full sm:w-auto">
              {user ? "Open Calculator" : "Log in"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-gray-400 text-sm font-medium">
        © 2026 FitForge. Built with Google Gemini AI.
      </footer>
    </div>
  );
}
