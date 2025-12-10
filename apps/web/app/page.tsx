import ModeSwitch from "@repo/ui/components/ModeSwitch";
import Box from "@repo/ui/primitives/Box";
import ButtonLink from "@repo/ui/primitives/ButtonLink";
import Typography from "@repo/ui/primitives/Typography";

export default function Home() {
  return (
    <Box className="flex min-h-screen flex-col bg-(--color-background-default)">
      {/* Navigation */}
      <Box
        component="header"
        className="fixed top-0 z-50 w-full backdrop-blur-md border-b border-(--color-divider) bg-(--color-background-default)/80"
      >
        <Box
          component="nav"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        >
          {/* Accessible Gradient Text: Visual gradient hidden from reader, plain text for reader */}
          <Box className="relative">
            <Typography
              variant="h6"
              className="font-bold bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent"
              aria-hidden="true"
            >
              GitHub Explorer
            </Typography>
            <span className="sr-only">GitHub Explorer</span>
          </Box>

          <Box className="flex items-center gap-4">
            <ModeSwitch />
            <ButtonLink
              href="/github-search"
              variant="contained"
              color="primary"
            >
              Launch App
            </ButtonLink>
          </Box>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        component="main"
        className="relative isolate pt-32 lg:pt-48 pb-20 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center"
      >
        {/* Background Elements */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <Box className="mx-auto max-w-7xl px-6 text-center">
          <Typography
            variant="h1"
            className="mb-8 text-5xl font-extrabold tracking-tight text-(--color-text-primary) sm:text-7xl"
          >
            Discover GitHub Users <br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Like Never Before
            </span>
          </Typography>

          <Typography
            variant="h5"
            component="p"
            className="mx-auto mb-10 max-w-2xl text-lg text-(--color-text-secondary) sm:text-xl/8"
          >
            A powerful, beautiful, and intuitive way to search and explore
            GitHub profiles. Built with modern web technologies for maximum
            performance.
          </Typography>

          <Box className="flex items-center justify-center gap-x-6">
            <ButtonLink
              href="/github-search"
              size="large"
              variant="contained"
              color="primary"
              className="px-8 py-4 text-lg font-semibold"
            >
              Start Searching
            </ButtonLink>
            <ButtonLink
              href="https://github.com"
              target="_blank"
              variant="text"
              color="secondary"
              className="text-lg font-semibold"
            >
              Learn more <span aria-hidden="true">→</span>
            </ButtonLink>
          </Box>
        </Box>

        {/* Bottom Background */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </Box>
    </Box>
  );
}
