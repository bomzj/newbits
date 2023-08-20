import '@picocss/pico/css/pico.min.css'
import './globals.css'
import WalletLayout from './WalletLayout'

export const metadata = {
  title: 'NewBits - Web Crypto Wallet',
  description: 'A lightweight, non-custodial(private), multi-chain, easy-to-use web crypto wallet on desktop and mobile devices.',
}

export default function RootLayout({ children }) {
  console.log('layout')
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"/> */}
      </head>
      <body>
        <WalletLayout>
          {children}
        </WalletLayout>
      </body>
    </html>
  )
}