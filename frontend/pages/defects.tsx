import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  // Beispielhafte Mängeldaten
  const [defects, setDefects] = useState([
    {
      object: "Parkhaus am Stadtgraben",
      location: "Eingang zu den Treppen im 2. Stock",
      shortDescription: "Tür schließt nicht richtig",
      detailDescription: "Beim Schließen der Tür kommt es manchmal zu Problemen.",
      reportingDate: "08.10.2024",
      status: "offen",
    },
    {
      object: "Parkplatz Zentrum",
      location: "Parkplatz 1",
      shortDescription: "Bodenbelag beschädigt",
      detailDescription: "Der Bodenbelag hat Risse und muss repariert werden.",
      reportingDate: "07.10.2024",
      status: "in Bearbeitung",
    },
    // Weitere Mängel können hier hinzugefügt werden
  ]);

  return (
    <>
      <Head>
        <title>Mängelverwaltung</title>
        <meta name="description" content="Anwendung zur Verwaltung von Mängeln" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
        <div className={styles.imageContainer}>
            <Image
              src="/parkhaus.png" // Den richtigen Pfad zum Bild angeben
              alt="Parkhaus"
              width={75} // oder eine geeignete Breite für dein Layout
              height={20} // oder eine geeignete Höhe für dein Layout
              layout="intrinsic" // Optional, um das Bild responsiv zu machen
            />
        <h1>GM-Parking Solutions</h1>
          </div>
          
          <h2>Mängelverwaltung</h2>
          <h3>Liste der Mängel</h3>
          <div className={styles.defectContainer}>
            {defects.map((defect, index) => (
              <div className={styles.defectCard} key={index}>
                <h3>{defect.object}</h3>
                <p><strong>Standort:</strong> {defect.location}</p>
                <p><strong>Kurzbeschreibung:</strong> {defect.shortDescription}</p>
                <p><strong>Detailbeschreibung:</strong> {defect.detailDescription}</p>
                <p><strong>Melddatum:</strong> {defect.reportingDate}</p>
                <p><strong>Status:</strong> <span className={styles[defect.status.toLowerCase()]}>{defect.status}</span></p>
              </div>
            ))}
          </div>

          {/* Hier kann der REST API-Aufruf erfolgen, um Mängel zu laden */}
          {/* 
          const fetchDefects = async () => {
            const response = await fetch('/api/defects');
            const data = await response.json();
            setDefects(data);
          };
          fetchDefects();
          */}

          <div className={styles.contact}>
            <h2>Kontakt</h2>
            <p>Mitglieder: Jannis Liebscher, Erik Manz</p>
          </div>
        </main>
        <footer className={styles.footer}>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            <Image
              aria-hidden
              src="https://nextjs.org/icons/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Lernen
          </a>
        </footer>
      </div>
    </>
  );
}
