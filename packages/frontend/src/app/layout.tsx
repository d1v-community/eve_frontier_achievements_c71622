import { type Metadata } from 'next'
import Header from '~~/components/layout/Header'
import Body from './components/layout/Body'
import Extra from './components/layout/Extra'
import Footer from './components/layout/Footer'
import { APP_DESCRIPTION, APP_NAME } from './config/main'
import ClientProviders from './providers/ClientProviders'
import { hasDatabaseUrl } from './server/db/client.mjs'
import { getSiteUrl } from './server/site'
import './styles/index.css'

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const databaseEnabled = hasDatabaseUrl()

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <ClientProviders databaseEnabled={databaseEnabled}>
          <div className="flex min-h-screen w-full flex-col gap-6">
            <Header />
            <Body>{children}</Body>
            <Footer />
            <Extra />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
