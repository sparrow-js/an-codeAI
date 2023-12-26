import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script id="inline-script" dangerouslySetInnerHTML={{ __html: `window.EXCALIDRAW_ASSET_PATH = "/"` }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
