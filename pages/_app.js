import Head from "next/head";
import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
function App({ Component, pageProps }) {
  return (
    <>
      <UserProvider>
        <Head>
          <title>Chatty Pete</title>
          <link rel="icon" href="/favicon.png" />
        </Head>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}

export default App;
