import Nav from '@/components/nav'
import Hero from '@/components/home/hero'
import Collection from '@/components/home/collection'
import Manifesto from '@/components/home/manifesto'
import Process from '@/components/home/process'
import Gallery from '@/components/home/gallery'
import ContactSection from '@/components/home/contact-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 72 }}>
        <Hero />
        <Collection />
        <Manifesto />
        <Process />
        <Gallery />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
