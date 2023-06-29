import '@picocss/pico/css/pico.min.css'
import './globals.css'

export const metadata = {
  title: 'NewBits - Web Crypto Wallet',
  description: 'A lightweight, non-custodial(private), multi-chain, easy-to-use web crypto wallet on desktop and mobile devices.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"/> */}
      </head>
      <body>
        {/* <header> 
          <nav>
            <ul>
              <li>Brand</li>
            </ul>
          </nav>
        </header> */}
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}