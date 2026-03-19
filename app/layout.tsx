// app/layout.tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Pinboard — Save what inspires you',
  description: 'A beautiful place to save and share your favorite images.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} font-sans bg-base text-primary antialiased`}>
        {/* ThemeProvider của next-themes — defaultTheme là dark, lưu vào localStorage */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="pinboard-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
