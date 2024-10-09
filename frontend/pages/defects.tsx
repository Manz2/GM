import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Defects.module.css";
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

export default function Defects() {
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
      status: "in-Bearbeitung",
    },
    // Weitere Mängel können hier hinzugefügt werden
  ]);
  

  const [newDefect, setNewDefect] = useState({
    object: "",
    location: "",
    shortDescription: "",
    detailDescription: "",
    reportingDate: "",
    status: "offen",
  });

  const handleAddDefect = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setDefects((prevDefects) => [...prevDefects, newDefect]);
    setNewDefect({
      object: "",
      location: "",
      shortDescription: "",
      detailDescription: "",
      reportingDate: "",
      status: "offen",
    }); // Formular zurücksetzen
  };

  return (
    <>
      <Head>
        <title>Defects</title>
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
          
          <h2>Defect managemant</h2>

<form onSubmit={handleAddDefect} className={styles.defectForm}>
            <h3>Neuen Mangel erstellen</h3>
            <input
              type="text"
              placeholder="Objekt"
              value={newDefect.object}
              onChange={(e) => setNewDefect({ ...newDefect, object: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Standort"
              value={newDefect.location}
              onChange={(e) => setNewDefect({ ...newDefect, location: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Kurzbeschreibung"
              value={newDefect.shortDescription}
              onChange={(e) => setNewDefect({ ...newDefect, shortDescription: e.target.value })}
              maxLength={80}
              required
            />
            <input
              placeholder="Detailbeschreibung"
              value={newDefect.detailDescription}
              onChange={(e) => setNewDefect({ ...newDefect, detailDescription: e.target.value })}
              required
            />
            <input
              type="date"
              value={newDefect.reportingDate}
              onChange={(e) => setNewDefect({ ...newDefect, reportingDate: e.target.value })}
              required
            />
            <select
              value={newDefect.status}
              onChange={(e) => setNewDefect({ ...newDefect, status: e.target.value })}
            >
              <option value="offen">Offen</option>
              <option value="in Bearbeitung">In Bearbeitung</option>
              <option value="geschlossen">Geschlossen</option>
              <option value="abgelehnt">Abgelehnt</option>
            </select>
            <button type="submit">Mangel hinzufügen</button>
          </form>


          <h3>List of defects</h3>
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
