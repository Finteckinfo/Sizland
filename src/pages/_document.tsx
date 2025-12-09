import { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { generateNonce, getCSP } from '@/utils/security';

export default function Document({ nonce }: { nonce: string }) {
  return (
    <Html>
      <Head nonce={nonce}>
        <meta httpEquiv="Content-Security-Policy" content={getCSP(nonce, process.env.NODE_ENV === 'development')} />
      </Head>
      <body>
        <Main />
        <NextScript nonce={nonce} />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const nonce = generateNonce();
  const initialProps = await ctx.defaultGetInitialProps(ctx, {
    nonce,
    // @ts-ignore - This is a valid option
    enhanceApp: (App) => (props) => <App {...props} nonce={nonce} />,
  });

  return {
    ...initialProps,
    nonce,
  };
};
