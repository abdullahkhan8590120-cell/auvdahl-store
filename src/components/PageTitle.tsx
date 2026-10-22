import { useEffect } from 'react'
export default function PageTitle({ text }: { text: string }) {
  useEffect(() => { document.title = text }, [text])
  return null
}
