import Link from 'next/link'

 export default function WelcomePage() {
  return (
    <section>
      <h1>Welcome to Newbits Wallet!</h1>
      <p>
      {/* Experience the security and convenience of a lightweight, non-custodial web crypto wallet with a modern UI. */}
        Secure, lightweight with a modern UI, non-custodial web crypto wallet. 
        You solely own your keys; Newbits doesn&apos;t have access to them.  
      </p>
      <Link href="/create-wallet" role='button' className='secondary'>Create a new wallet</Link>
      <Link href="/restore-wallet" role='button' className="secondary outline">Restore a wallet</Link>
      <footer>
        <small>No app installations or browser extensions needed - access your assets with ease.</small>
      </footer>
    </section>
  )
}