import { publicEnv } from '@/config/env';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl items-center px-6 py-16 sm:px-10">
      <section aria-labelledby="page-title" className="max-w-2xl space-y-5">
        <p className="text-sm font-medium tracking-wide text-neutral-600 dark:text-neutral-300">
          Platform foundation
        </p>
        <h1 id="page-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {publicEnv.appName}
        </h1>
        <p className="text-lg leading-8 text-neutral-700 dark:text-neutral-200">
          The web application foundation is in place. Product capabilities will be introduced as
          their requirements are approved.
        </p>
      </section>
    </main>
  );
}
