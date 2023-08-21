import Image from 'next/image'
import Link from 'next/link'
import { cond, equals, always, T } from 'ramda'
import { useWallet } from './WalletContext'
  
export default function Nav({ children }) {
  const { status } = useWallet()
  
  const logoUrl = cond([
    [equals('loaded'), always('/')],
    [equals('locked'), always('/unlock-wallet')],
    [equals('not_exists'), always('/welcome')],
    [T, always('/')]
  ])(status)

  return (
    <nav className="container-fluid">
      <ul>
        <li>
          <Link href={logoUrl}>
            <Image src="favicon.svg" width={66.5} height={66.5} alt='Newbits'/>
          </Link>
        </li>

        {status == 'not_exists' &&
          <li>
            <Link href="/create-wallet" className='secondary'>Create wallet</Link>
          </li>
        }
        
        {status == 'loaded' &&
          <>
            <li><Link href="/receive" className='secondary'>Receive</Link></li>
            <li><Link href="/send" className='secondary'>Send</Link></li>
          </>
        }
      </ul>
      <ul>
        <li>
          <Link href='https://github.com/bomzj/newbits' target='_blank'>
            <Image 
              src="github-mark.svg" 
              width={24} 
              height={24} 
              alt='Newbits Github Source Code' 
            />
          </Link>
        </li>
      </ul>
    </nav>
  )
}