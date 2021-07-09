import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import DetectLicense from '../components/detect'
import utilStyles from '../styles/utils.module.css'

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
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      
      <section className={utilStyles.headingMd}>
        <DetectLicense />
      </section>
    </Layout>
  )
}
