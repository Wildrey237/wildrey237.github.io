import Navbar from "./components/Navbar";

let logoPHP ="https://www.freepnglogos.com/uploads/php-logo-png/php-logo-php-elephant-logo-vectors-download-5.png";
let logoJava ="";
let logoJS ="https://www.freepnglogos.com/pics/javascript";
let logoPython ="";
function Myskill() {
  return (
    <main className="page">

      <section className="main-skills">
          <article className={"skill-block"}>
              <h1>Programation</h1>
              <div className={"text-logo"}>
                  <div data-width="95%" className={"hello"}></div>
                  <div><p>Php</p></div>
                  <div><img src={logoPHP} className={"skill-logo"}></img></div>
              </div>
              <div className="modal-content">
                  <h2>Framework</h2>
                  <p>Symfony</p><br></br>
              </div>
              <p className={""}>Python </p>
              <div className="modal-content">
                  <h2> Framework </h2>
                  <p>DJANGO</p><br></br>
                  <p>Python pour la creation d'application WEB</p><br></br>
                  <p>Anaconda</p>
                  <p>Python pour l'analyse de données</p><br></br>
              </div>
              <p className={""}>Java</p><br></br>
              <p className={""}>Javascript - NodeJs</p><br></br>
              <h2> Framework </h2>
              <p>React Js</p><br></br>
              <br/><br/>
          </article>

          <article className={'skill-block'}>
              <h1>Base de donnée</h1>
              <p className={""}>SQL</p>   <br></br>
              <p className={""}>FireBase</p><br></br>
              <p className={""}>System Inter Cache</p><br></br>
              <p className={""}>MERISE</p><br></br>
              <br /><br />
          </article>

          <article className={'skill-block'}>
              <h1>Marketing</h1>
              <p className={""}>Marketing digital</p><br></br>
              <p className={""}>Gestion et analyse des données digitales</p><br></br>
              <p className={""}>SEO</p><br></br>
              <p className={""}>Google Analytics</p><br></br>
              <br /><br />
          </article>

          <article className={'skill-block'}>
              <h1>Environement-Reseau</h1>
              <p className={""}>Linux - Ubuntu</p>
              <div>
                  <p> Creation d'un serveur Web Linux et communication en SSH</p>
              </div>
              <p className={""}>Cloud computing</p>
              <div>
                  <p>Creation d'un serveur Web avec Google Cloud et node.js</p>
              </div>
              <br></br>
          </article>

        <br /><br />
        </section>
      <div className="navbar_container">
        <Navbar/>
      </div>
      <div className="navbar_mobile_container">
        <Navbar/>
      </div>
    </main>
  );
}

export default Myskill;
