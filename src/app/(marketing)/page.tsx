import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full overflow-clip bg-background">
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/ensakh.png')`,
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-4xl leading-tight">
            Manage your conference with ease.
          </h1>

          <div className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none">
            <Button
              size="lg"
              className="hover:bg-primary/90 px-6 sm:px-8 py-3 text-base sm:text-lg cursor-pointer w-full sm:w-auto"
            >
              Learn More
            </Button>
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="px-6 sm:px-8 py-3 text-base sm:text-lg cursor-pointer w-full"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-12 sm:mt-16 md:mt-20" />

      <footer className="flex flex-col justify-between gap-4 py-6 border-border border-t bg-card">
        <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-4 px-4 sm:px-6">
          <div className="text-center lg:text-left">
            <Logo height={32} width={110} />
            <p className="text-muted-foreground mt-2">
              A simplified conference manager.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-3 text-center sm:text-left">
            <div className="min-w-36">
              <p className="font-semibold text-foreground mb-3">Learn</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tutorials
                  </Link>
                </li>
              </ul>
            </div>
            <div className="min-w-36">
              <p className="font-semibold text-foreground mb-3">Resources</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Github
                  </Link>
                </li>
              </ul>
            </div>
            <div className="min-w-36">
              <p className="font-semibold text-foreground mb-3">Legal</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center p-4 border-t border-border">
          <p className="text-muted-foreground text-center text-sm">
            © 2025 chairio. Built with ❤️ by Marouane Lemghari & Aymane
            Derrouich.
          </p>
        </div>
      </footer>
    </div>
  );
}
