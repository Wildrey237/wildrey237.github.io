import Navbar from "./components/Navbar";
import {useState} from "react";


function Home() {
    const profile_photo = "https://cdn.discordapp.com/attachments/958463954206732298/1038050944971190282/Wilfried_NB.png"
    const cv ="https://cdn.discordapp.com/attachments/958463954206732298/1043907012834099260/CV_ECOLE.pdf"
    const [navbar, setNavbar] = useState(true);
    const [navbarMobile, setNavbarMobile] = useState(true);
  return (
    <main className="page-home">
      <section className="main-home">
          <article className={"article-home"}>
              <h1 className={"h1-home"}>Salut, je suis Wilfried Etudiant en informatique</h1>
              <h2 className={"h2-home"}> A la recherche d'un stage de 4 mois dans la data et l'intelligence artificielle</h2>
              <p className={"type_machine"}> En Bachelor 2e année à ECE Paris</p>
              <br /><br />
              <div className={"btn-Contact"}>
                  <a href={"/contact"}><input type={"button"} className={"green_empty_btn"} value={"Contactez-moi"}/></a> <a href={cv}> <input type={"button"} className={"green_empty_btn"} value={"Uploader mon CV"}/> </a>
              </div>
          </article>
          <article className={"article-photo"}>
              <img className={"img-profile"} src={profile_photo}/>
          </article>
        </section>
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
    </main>
  );
}

export default Home;
