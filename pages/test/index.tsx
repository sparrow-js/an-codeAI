"use client"
import { useState } from 'react'


export default function Home() {
  const [code, setCode] = useState<string>('');
  const clickHandler = () => {}
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex h-[500px]">
        <div data-uid="1111">test</div>
    </div>
  )
}
