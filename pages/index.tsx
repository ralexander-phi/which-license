import 'bulma/css/bulma.css'
import {Helmet} from "react-helmet";

import DetectLicense from '../components/detect';

export default function Home({
  allPostsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[]
}) {
  return (
    <>
    <Helmet>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Which License?</title>
    </Helmet>
    <nav className="navbar is-dark pb-2" role="navigation" aria-label="main navigation">
    <div className="navbar-brand">
    <h1 className="title p-4 has-text-light">Which License?</h1>
    </div>
    </nav>

    <section className="section">
    <DetectLicense />
    </section>

    <footer className="footer">
    <p>Information is provided without warranty.</p>
    <p>This is not legal advice</p>
    <p>Fork me on <a href="https://github.com/ralexander-phi/which-license">GitHub</a></p>
    </footer>
    <script data-goatcounter="https://alexsci.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
    </>
  )
}
