import Link from "next/link";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
    subsets: ["latin"],
  });

  const dmSerif = DM_Serif_Display({
    weight: "400",
    subsets: ["latin"],
  });

export default function LandingPage() {
  return (
    <>
      <div className={`${dmSans.className} min-h-screen bg-white text-stone-900 antialiased`} >
        {/* NAV */}
        <nav className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stone-200 bg-white/90 px-12 backdrop-blur-md max-sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-[9px] text-[17px] font-medium tracking-[-0.3px]"
          >
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-violet-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M2 3h12v7a2 2 0 01-2 2H6l-3 2v-2H2V3z" />
              </svg>
            </div>

            Convo
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex h-[38px] items-center justify-center rounded-[10px] px-5 text-sm font-medium text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="inline-flex h-[38px] items-center justify-center rounded-[10px] bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="mx-auto max-w-[720px] px-6 pb-20 pt-24 text-center">
          <div className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-[13px] font-medium tracking-[-0.1px] text-violet-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600" />
            Real-time messaging
          </div>

          <h1
            className={`${dmSerif.className} mb-5 text-[58px] leading-[1.08] tracking-[-1.5px] text-stone-900 max-sm:text-[40px]`}
          >
            Chat that
            <br />
            feels <em className="italic text-violet-600">instant</em>
          </h1>

          <p className="mx-auto mb-10 max-w-[480px] text-[17px] font-light leading-[1.65] text-stone-500">
            Rooms, direct messages, and live presence — all in one clean interface.
            Built for people who just want to talk.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-7 text-[15px] font-medium text-white transition hover:bg-violet-700"
            >
              Create an account

              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 7h9M7 2.5L11.5 7 7 11.5" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-300 px-7 text-[15px] font-medium text-stone-900 transition hover:bg-stone-50 hover:border-stone-400"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* APP PREVIEW */}
        <div className="mx-auto mb-[100px] max-w-[820px] px-6">
          <div className="overflow-hidden rounded-[20px] border border-stone-200 bg-white">
            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="h-[10px] w-[10px] rounded-full bg-[#ff6159]" />
              <div className="h-[10px] w-[10px] rounded-full bg-[#ffbe2e]" />
              <div className="h-[10px] w-[10px] rounded-full bg-[#28c941]" />
            </div>

            <div className="flex h-[340px]">
              {/* Sidebar */}
              <div className="w-[220px] shrink-0 border-r border-stone-100 py-4 max-sm:hidden">
                <div className="mb-2 px-4 text-[11px] font-medium uppercase tracking-[0.6px] text-stone-400">
                  Messages
                </div>

                {[
                  {
                    initials: "SM",
                    cls: "bg-blue-100 text-blue-800",
                    name: "Sarah M.",
                    preview: "Sounds good to me",
                    online: true,
                    active: true,
                  },
                  {
                    initials: "RK",
                    cls: "bg-green-100 text-green-800",
                    name: "Raj K.",
                    preview: "On it right now",
                    online: true,
                    active: false,
                  },
                  {
                    initials: "JL",
                    cls: "bg-amber-100 text-amber-800",
                    name: "Jordan L.",
                    preview: "Can we reschedule?",
                    online: false,
                    active: false,
                  },
                  {
                    initials: "AP",
                    cls: "bg-pink-100 text-pink-800",
                    name: "Anika P.",
                    preview: "Thanks, got it!",
                    online: false,
                    active: false,
                  },
                  {
                    initials: "MN",
                    cls: "bg-teal-100 text-teal-800",
                    name: "Milan N.",
                    preview: "Let's ship it",
                    online: true,
                    active: false,
                  },
                ].map((c) => (
                  <div
                    key={c.name}
                    className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 transition hover:bg-stone-50 ${
                      c.active ? "bg-violet-100" : ""
                    }`}
                  >
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium ${c.cls}`}
                    >
                      {c.initials}

                      <span
                        className={`absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full border-2 border-white ${
                          c.online ? "bg-green-500" : "bg-stone-400"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-stone-900">
                        {c.name}
                      </div>

                      <div className="mt-px truncate text-[12px] text-stone-400">
                        {c.preview}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Area */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex items-center gap-2.5 border-b border-stone-100 px-5 py-[14px]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[12px] font-medium text-blue-800">
                    SM
                  </div>

                  <div>
                    <div className="text-sm font-medium">Sarah M.</div>
                    <div className="mt-px text-[12px] text-green-500">● Online</div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-hidden px-5 py-4">
                  <div className="flex max-w-[80%] items-end gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-medium text-blue-800">
                      SM
                    </div>

                    <div className="rounded-2xl rounded-bl px-[13px] py-[9px] text-[13px] leading-[1.5] text-stone-900 bg-stone-100">
                      Hey! Did you review the PR?
                    </div>
                  </div>

                  <div className="flex max-w-[80%] flex-row-reverse items-end gap-2 self-end">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[11px] font-medium text-teal-900">
                      Me
                    </div>

                    <div>
                      <div className="rounded-2xl rounded-br px-[13px] py-[9px] text-[13px] leading-[1.5] text-white bg-violet-600">
                        Yes, left a few comments. Looks solid overall.
                      </div>

                      <div className="mt-0.5 text-right text-[11px] text-violet-300">
                        ✓✓
                      </div>
                    </div>
                  </div>

                  <div className="flex max-w-[80%] items-end gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-medium text-blue-800">
                      SM
                    </div>

                    <div className="rounded-2xl rounded-bl bg-stone-100 px-[13px] py-[9px] text-[13px] leading-[1.5] text-stone-900">
                      Sounds good to me 👍
                    </div>
                  </div>

                  <div className="flex max-w-[80%] flex-row-reverse items-end gap-2 self-end">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[11px] font-medium text-teal-900">
                      Me
                    </div>

                    <div>
                      <div className="rounded-2xl rounded-br bg-violet-600 px-[13px] py-[9px] text-[13px] leading-[1.5] text-white">
                        Let&apos;s merge once CI passes.
                      </div>

                      <div className="mt-0.5 text-right text-[11px] text-violet-300">
                        ✓
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 border-t border-stone-100 px-5 py-3">
                  <div className="flex h-9 flex-1 items-center rounded-lg border border-stone-100 bg-stone-50 px-3 text-[13px] text-stone-400">
                    Type a message…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section className="mx-auto mb-[100px] max-w-[820px] px-6">
          <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 md:grid-cols-3 gap-px">
            {[
              {
                title: "Real-time delivery",
                desc: "Messages arrive instantly over WebSockets. No polling, no lag.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
              },
              {
                title: "Live presence",
                desc: "See who's online right now. Presence updates as people join and leave.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                ),
              },
              {
                title: "Rooms & DMs",
                desc: "Group rooms with join codes, plus one-on-one direct messages.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                ),
              },
              {
                title: "Delivery receipts",
                desc: "Single tick for sent, double tick for delivered, blue for read.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
              {
                title: "Secure by default",
                desc: "JWT auth with access and refresh tokens. HTTPS end to end.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                ),
              },
              {
                title: "Built to scale",
                desc: "Redis-backed presence and pub/sub fan-out for horizontal scaling.",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white px-6 py-7">
                <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  {feature.icon}
                </div>

                <h3 className="mb-1.5 text-sm font-medium tracking-[-0.2px] text-stone-900">
                  {feature.title}
                </h3>

                <p className="text-[13px] font-light leading-[1.55] text-stone-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="mx-auto mb-20 max-w-[820px] px-6">
          <div className="rounded-[20px] border border-stone-200 bg-stone-50 px-10 py-[52px] text-center max-sm:px-6 max-sm:py-9">
            <h2
              className={`${dmSerif.className} mb-3 text-[36px] tracking-[-0.8px] text-stone-900`}
            >
              Ready to start chatting?
            </h2>

            <p className="mb-7 text-[15px] font-light text-stone-600">
              Create a free account or sign in to continue.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-violet-600 px-7 text-[15px] font-medium text-white transition hover:bg-violet-700"
              >
                Create an account
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-300 px-7 text-[15px] font-medium text-stone-900 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex items-center justify-between border-t border-stone-100 px-12 py-6 max-sm:flex-col max-sm:gap-2 max-sm:px-5 max-sm:text-center">
          <Link
            href="/"
            className="flex items-center gap-[9px] text-sm font-medium tracking-[-0.3px]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                <path d="M2 3h12v7a2 2 0 01-2 2H6l-3 2v-2H2V3z" />
              </svg>
            </div>

            Convo
          </Link>

          <p className="text-[13px] text-stone-400">
            Built by Ashutosh Chaturvedi
          </p>
        </footer>
      </div>
    </>
  )
};
