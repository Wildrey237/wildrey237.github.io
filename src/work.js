import Navbar from "./components/Navbar";
import {useState} from "react";


function Work() {
    const image_projet_TDA_1 = "https://cdn.discordapp.com/attachments/958463954206732298/1039661989024243722/img2.PNG"
    const image_projet_TDA_2 = "https://cdn.discordapp.com/attachments/958463954206732298/1039664085622603866/image.png"
    const image_projet_TDA_3 = ""
    const image_projet_TDA_4 = ""
    const [navbar, setNavbar] = useState(true);
    const [navbarMobile, setNavbarMobile] = useState(true);
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
              <div className={"modal"}>
                  <p>Stage au cours du quel j'ai eu à realiser une application pour l'affichage des informations et details concernants des frets douaniares pour l'aeroport du cameroun </p>
                  <h2>Technologie</h2>
                  <ul>
                      <li>JavaScript</li>
                      <li>JSON</li>
                      <li><a href={""}>Intersystem Cache</a></li>
                  </ul>
                  <h2>Capture</h2>
                  <img className={"img_projet"} src={image_projet_TDA_1}/>
                  <img className={"img_projet"} src={image_projet_TDA_2}/>
                  <img className={"img_projet"} src={image_projet_TDA_3}/>
                  <img className={"img_projet"} src={image_projet_TDA_4}/>
              </div>
              <br></br>
              <h2 className="type_machine">ICCSOFT - YDE CMR - Stagiaire</h2>
              <div className={"modal"}>
                  <ul>
                      <li>Stage de découverte de l'entreprise où j'ai euà réaliser une to-do-list à l'aide de PHP</li>
                  </ul>
              </div>
              <br></br>
              <h2 className="type_machine">INNOVATECH - YDE CMR - Stagiaire,</h2><br></br>
              <div className={"modal"}>
                  <ul>
                      <li>Formation à l'utilisation de Arduino et son langage : où j'ai eu à réaliser un Smart Parking</li>
                      <li>Annimation d'atelier sur Arduino</li>
                      <li>Creation d'un site Web vitrine</li>
                  </ul>
              </div>
              <br /><br />
          </div>

          <div>
              <h1>Formations</h1>
              <h2 className="type_machine"><a href={"https://www.ece.fr/"}>ECE - PARIS FR - 2e année Bachelor</a></h2>
              <br></br>
              <h2 className="type_machine"><a href={""}>EPSI - RENNES FR - 1ere année Bachelor</a></h2>
              <br></br>
              <h2 className="type_machine"><a href={""}>Institut Saint Jean - YDE CMR - Prépa 1ere année</a></h2>
              <br></br>
              <h2 className="type_machine"><a href={""}>Collège François Xavier Vogt- YDE CMR - Terminale TI</a></h2>
              <br></br>
              <br /><br />
          </div>
        </div>
        <div className={"navbar_container"}>
            <Navbar/>
        </div>
        <div className={"navbar-bottom"}>
            {navbar ? (
                <div onClick={()=>{
                    setNavbar(false);
                }
                }>Navbar</div>
            ) : (
                <div className={"navbar_mobile_container"}>
                    <div onClick={()=>{
                        setNavbar(true);
                    }
                    }>Close</div>
                    <Navbar/>
                </div>) }
        </div>
    </div>
  );
}

export default Work;
