"use client"
import { useState } from 'react'
import dynamic from "next/dynamic";
const REACT_ANTD_MOCK_CODE = `
function htmlRender {
    return (
        <html lang="zh-CN">
            <head>
                <title>News Feed</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-100" uid="xxx">
                <div class="max-w-2xl mx-auto py-8">
                    <div class="bg-white p-6 mb-4 shadow-sm">
                        <h2 class="text-xl font-semibold">hippo 🦛 - 提升我們團隊工程效率的工具</h2>
                    </div>
                </div>
            </body>
        </html>
    );
}
`;

const DesignerBox = dynamic(
  async () => (await import("../../engine")),
  {
    ssr: false,
  },
)
// import setCodeUid from './TsTest';

// setCodeUid(REACT_ANTD_MOCK_CODE);

export default function Home() {
  const [code, setCode] = useState<string>('');
  const clickHandler = () => {}
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex h-[500px]">
        {/* <DesignerBox /> */}
    </div>
  )
}
