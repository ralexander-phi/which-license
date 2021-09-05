import 'bulma/css/bulma.css'

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
    <html>
      <head>Which License?</head>
      <body>
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
        </footer>
      </body>
    </html>
  )
}
