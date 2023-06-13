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
              <h1 className={"h1-skill"}>Programation</h1>
              <h2 className={"h2-skill"}>PHP</h2>
              <h2 className={"h2-skill"}>Python </h2>
              <div className="modal-content">
                  <span> Framework </span>
                  <p>DJANGO</p><br></br>
                  <p>Python pour la creation d'application WEB</p><br></br>
                  <p>Anaconda</p>
                  <p>Python pour l'analyse de données</p><br></br>
              </div>
              <p className={"h2-skill"}>Java</p><br></br>
              <p className={"h2-skill"}>Javascript - NodeJs</p><br></br>
              <h2> Framework </h2>
              <p>React Js</p><br></br>
              <br/><br/>
          </article>

          <article className={'skill-block'}>
              <h1 className={"h1-skill"}>Base de donnée</h1>
              <h2 className={"h2-skill"}>SQL</h2>   <br></br>
              <h2 className={"h2-skill"}>FireBase</h2><br></br>
              <h2 className={"h2-skill"}>System Inter Cache</h2><br></br>
              <h2 className={"h2-skill"}>MERISE</h2><br></br>
              <br /><br />
          </article>

          <article className={'skill-block'}>
              <h1 className={"h1-skill"}>Environement-Reseau</h1>
              <h2 className={"h2-skill"}>Linux - Ubuntu</h2>
              <div>
                  <p> Creation de serveur Web Linux et communication en SSH</p>
              </div>
              <h2 className={"h2-skill"}>Cloud computing</h2>
              <div>
                  <p>Creation de serveur Web avec Google Cloud et node.js</p>
              </div>
              <br></br>
          </article>

          {/*<article className={'skill-block'}>*/}
          {/*    <h1>Marketing</h1>*/}
          {/*    <h2 className={""}>Marketing digital</h2><br></br>*/}
          {/*    <h2 className={""}>Gestion et analyse des données digitales</h2><br></br>*/}
          {/*    <h2 className={""}>SEO</h2><br></br>*/}
          {/*    <h2 className={""}>Google Analytics</h2><br></br>*/}
          {/*    <br /><br />*/}
          {/*</article>*/}

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
