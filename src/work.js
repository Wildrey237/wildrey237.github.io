import Navbar from "./components/Navbar";


function Work() {
  return (
    <div className="page">

      <div className="main">
          <div>
              <h1>Experience</h1>
              <h2 className="type_machine">ECE - PARIS FR - 2e année Bachelor,</h2>
              <div>
                  Application Web en PHP
              </div>
              <br></br>
              <h2 className="type_machine">TOULLEC DANCOING ASSOCIES </h2>
              <br></br>
              <h2 className="type_machine">ICCSOFT - YDE CMR - Stagiaire</h2>
              <ul>
                  <li>Stage de découverte de l'entreprise où j'ai euà réaliser une to-do-list à l'aide de PHP</li>
              </ul>
              <br></br>
              <h2 className="type_machine">INNOVATECH - YDE CMR - Stagiaire,</h2><br></br>
              <ul>
                  <li>Formation à l'utilisation de Arduino et son langage : où j'ai eu à réaliser un Smart Parking</li>
                  <li>Annimation d'atelier sur Arduino</li>
                  <li>Creation d'un site Web vitrine</li>
              </ul>
              <br /><br />
          </div>

          <div>
              <h1>Formations</h1>
              <h2 className="type_machine">ECE - PARIS FR - 2e année Bachelor,</h2>
              <br></br>
              <h2 className="type_machine">EPSI - REN FR - 1ere année Bachelor ,</h2>
              <br></br>
              <h2 className="type_machine">Institut Saint Jean - YDE CMR - Prépa 1ere année,</h2>
              <br></br>
              <h2 className="type_machine">Collège François Xavier Vogt- YDE CMR - Terminale TI,</h2>
              <br></br>
              <br /><br />
          </div>

          <div>
              <h1>Projet</h1>
              <h1></h1>
          </div>

        </div>
      <div className="navbar_container">
        <Navbar/>
      </div>
      <div className="navbar_mobile_container">
        <Navbar/>
      </div>
    </div>
  );
}

export default Work;
