import '@picocss/pico/css/pico.min.css'
import './globals.css'

//import { PasswordProvider } from './password'

export const metadata = {
  title: 'Crypto Web Wallet',
  description: 'Crypto Web Wallet',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"/> */}
      </head>
      <body>
          {/* <header> */}
          {/* <nav>
            <ul>
              <li>Brand</li>
            </ul>
          </nav> */}
        {/* </header> */}
        <main className="container">
            {children}
        </main>
      </body>
    </html>
  )
}