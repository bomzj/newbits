import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
  
export default function Redirect({ to, when, children }) {
  const { push } = useRouter()
  
  useEffect(() => {
    if (when) push(to)
  })

  // Avoid page flashing when redirect is required
  return !when && children
}