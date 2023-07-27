import Link from 'next/link'

 export default function WelcomePage() {
  return (
    <section>
      <h1>Welcome to NewBits Web Crypto Wallet!</h1>
      {/* <hgroup>
        <h1>Crypto Wallet</h1>
        <h4>Nullam dui arcu, malesuada et sodales eu, efficitur vitae dolor. Sed ultricies dolor non
        ante vulputate hendrerit. Vivamus sit amet suscipit sapien.</h4>
      </hgroup> */}
      <p>
        It&apos;s a lightweight, non-custodial web wallet with a modern UI that doesn&apos;t require app installations or browser extensions. 
        You solely own your keys; NewBits doesn&apos;t have access to them.
      </p>
      <Link href="/create-wallet" role='button'>Create a new wallet</Link>
      <Link href="/restore-wallet" role='button' className="secondary outline">Restore a wallet</Link>
      <footer><small>Duis nec elit placerat, suscipit nibh quis, finibus neque.</small></footer>
    </section>
  )
}