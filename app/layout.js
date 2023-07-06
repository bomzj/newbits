import '@picocss/pico/css/pico.min.css'
import './globals.css'
// import { WalletProvider } from './wallet'
// import { RedirectHandler } from './RedirectHandler'
// import { Nav } from './Nav'
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
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"/> */}
      </head>
      <body>
        <WalletLayout>
          {children}
        </WalletLayout>
        
        {/* <WalletProvider>
          <RedirectHandler>
            <Nav />
            <main className="container">
              {children}
            </main>
          </RedirectHandler>
        </WalletProvider> */}
      </body>
    </html>
  )
}