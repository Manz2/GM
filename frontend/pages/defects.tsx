import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Defects.module.css";
import { DefectsApi, DeleteDefectRequest } from "@/api/apis/DefectsApi";
import { Defect } from "@/api/models/Defect";
import { DefectStatusEnum } from "@/api/models/Defect";
import { useEffect, useState } from "react";

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
  const [defects, setDefects] = useState<Defect[]>([]);
  const [newDefect, setNewDefect] = useState<Defect>({
    property: '',
    location: '',
    descriptionShort: '',
    descriptionDetailed: '',
    reportingDate: new Date(),
    status: 'Offen',
  });
  const [filter, setFilter] = useState({
    property: '',
    status: '',
  });

  useEffect(() => {
    fetchDefects();
  }, []);

  const handleDeleteDefect = (defectId: string) => {
    const defectsApi = new DefectsApi();
    const requestParameters = { id: defectId };

    defectsApi.deleteDefect(requestParameters) // Hier solltest du den richtigen API-Aufruf zum Löschen des Defekts verwenden
      .then(() => {
        console.log('Defekt erfolgreich gelöscht');
        fetchDefects(); // Lade die Defekte neu
      })
      .catch(error => {
        console.error('Fehler beim Löschen des Defekts:', error);
      });
  };


  const fetchDefects = async () => {
    const defectsApi = new DefectsApi();
    try {
      const requestParameters = {
        property: filter.property || undefined, // Setze auf null, wenn leer
        status: filter.status as DefectStatusEnum || undefined        // Setze auf null, wenn leer
      };

      console.log('Fetching defects with parameters:', requestParameters);
      const response = await defectsApi.listDefects(requestParameters);
      setDefects(response);
    } catch (error) {
      console.error('Fehler beim Laden der Mängel:', error);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault(); // Verhindert das Neuladen der Seite
    fetchDefects(); // Filtere die Mängel
  };


  const handleAddDefect = (e: { preventDefault: () => void; }) => {
    e.preventDefault(); // Verhindert, dass die Seite neu geladen wird
    const defectsApi = new DefectsApi();
    // Rufe die addDefect Methode auf und übergebe das Defekt-Objekt
    defectsApi.addDefect({ defect: newDefect })
      .then(response => {
        console.log('Defekt erfolgreich hinzugefügt:', response);
        fetchDefects();
      })
      .catch(error => {
        console.error('Fehler beim Hinzufügen des Defekts:', error);
      });
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
              value={newDefect.property}
              onChange={(e) => setNewDefect({ ...newDefect, property: e.target.value })}
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
              value={newDefect.descriptionShort}
              onChange={(e) => setNewDefect({ ...newDefect, descriptionShort: e.target.value })}
              maxLength={80}
              required
            />
            <input
              placeholder="Detailbeschreibung"
              value={newDefect.descriptionDetailed}
              onChange={(e) => setNewDefect({ ...newDefect, descriptionDetailed: e.target.value })}
              required
            />
            <input
              type="date"
              value={newDefect.reportingDate ? newDefect.reportingDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setNewDefect({ ...newDefect, reportingDate: new Date(e.target.value) })}
              required
            />
            <select
              value={newDefect.status}
              onChange={(e) => setNewDefect({ ...newDefect, status: e.target.value as DefectStatusEnum })}
            >
              <option value="Offen">Offen</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Geschlossen">Geschlossen</option>
              <option value="Abgelehnt">Abgelehnt</option>
            </select>
            <button type="submit">Mangel hinzufügen</button>
          </form>


          <h3>List of defects</h3>
          <form onSubmit={handleFilterSubmit} className={styles.defectForm}>
            <h3>Filter</h3>
            <input
              type="text"
              placeholder="Objekt"
              value={filter.property}
              onChange={(e) => setFilter({ ...filter, property: e.target.value })}
            />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as DefectStatusEnum })}
            >
              <option value="">Alle</option>
              <option value="Offen">Offen</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Geschlossen">Geschlossen</option>
              <option value="Abgelehnt">Abgelehnt</option>
            </select>
            <button type="submit">Apply</button>
          </form>
          <div className={styles.defectContainer}>
            {defects.map((defect, index) => (
              <div className={styles.defectCard} key={index}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>{defect.property}</h3>
                  <button type="button" onClick={() => defect.id && handleDeleteDefect(defect.id)}>delete</button>
                </div>
                <p><strong>Standort:</strong> {defect.location}</p>
                <p><strong>Kurzbeschreibung:</strong> {defect.descriptionShort}</p>
                <p><strong>Detailbeschreibung:</strong> {defect.descriptionDetailed}</p>
                <p><strong>Melddatum:</strong> {defect.reportingDate?.toString()}</p>
                <p><strong>Status:</strong> <span className={styles[defect.status?.toLowerCase() || 'undefined']}>{defect.status || 'Unbekannt'}</span></p>
              </div>
            ))}
          </div>

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
