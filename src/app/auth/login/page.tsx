

import { Suspense } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { GridPattern } from "@/components/ui/grid-pattern"
import { Terminal, TypingAnimation } from "@/components/ui/terminal"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex items-center justify-center bg-muted overflow-hidden">
        {/* Background grid pattern */}
        <GridPattern className="absolute inset-0 h-full w-full" width={40} height={40} strokeDasharray="4 4" />
        {/* Terminal animation */}
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <Terminal className="bg-background/80 shadow-xl backdrop-blur">
            <TypingAnimation className="text-lg font-bold text-primary" duration={40}>
              Welcome to Netkrida Finance System
            </TypingAnimation>
            <TypingAnimation className="text-base text-muted-foreground" duration={30}>
              Empowering your financial management.
            </TypingAnimation>
            <TypingAnimation className="text-base text-muted-foreground" duration={30}>
              Secure. Reliable. Easy to use.
            </TypingAnimation>
            <TypingAnimation className="text-base text-primary" duration={30}>
              Login to get started 🚀
            </TypingAnimation>
          </Terminal>
        </div>
      </div>
    </div>
  )
}
