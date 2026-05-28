import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BarChart3, Wallet, TrendingUp, Globe, Sparkles, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-wider">SPENDWISE AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Finance Tracking
          </div>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-6xl">
            Take Control of Your
            <span className="block text-primary">Financial Future</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Track income and expenses, visualize your spending patterns with beautiful charts, 
            and get AI-powered insights to make smarter financial decisions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Everything You Need to Manage Money</h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features to help you track, analyze, and optimize your finances
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-income/10">
                <TrendingUp className="h-6 w-6 text-income" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Income Tracking</h3>
              <p className="mt-2 text-muted-foreground">
                Track salaries, freelance income, and recurring payments. Set up automatic recurring entries.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-expense/10">
                <BarChart3 className="h-6 w-6 text-expense" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Expense Analytics</h3>
              <p className="mt-2 text-muted-foreground">
                Categorize expenses and visualize spending patterns with interactive charts and reports.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-balance/10">
                <Globe className="h-6 w-6 text-balance" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Multi-Currency</h3>
              <p className="mt-2 text-muted-foreground">
                Support for 10+ currencies with live exchange rates. Convert amounts instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Shield className="h-4 w-4" />
            Secure & Private
          </div>
          <h2 className="mt-6 text-3xl font-bold">Ready to Start Saving?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of users who have transformed their financial habits with SpendWise AI.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="mt-8 gap-2">
              Get Started for Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, MongoDB, and Clerk Authentication</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} SpendWise AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
