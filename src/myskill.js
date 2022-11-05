import Navbar from "./components/Navbar";


function Myskill() {
  return (
    <div className="page">

      <div className="main">
          <div>
              <h1>Programation</h1>
              <p className="type_machine">Php,</p>
              <h2> Framework </h2>
              <p>Symfony</p><br></br>
              <p className="type_machine">Python </p>
              <progress id="file" max="100" value="30"> 30% </progress>
              <p> Python pour la creation d'application WEB (DJANGO)</p><br></br>
              <p className="type_machine">Java</p><br></br>
              <p className="type_machine">Javascript</p><br></br>
              <h2> Framework </h2>
              <p>Node Js</p>
              <p>React Js</p><br></br>
              <br /><br />
          </div>

          <div>
              <h1>Base de donnée</h1>
              <p className="type_machine">UML et MERISE</p><br></br>
              <p className="type_machine">SQL</p>   <br></br>
              <p className="type_machine">FireBase</p><br></br>
              <p className="type_machine"> System Inter Cache</p><br></br>
              <br /><br />
          </div>

          <div>
              <h1>Marketing</h1>
              <p className="type_machine">Marketing digital,</p><br></br>
              <p className="type_machine">Gestion et analyse des données digitales ,</p><br></br>
              <p className="type_machine">SEO,</p><br></br>
              <p className="type_machine">Google Analytics,</p><br></br>
              <br /><br />
          </div>

          <div>
              <h1>Environement-Reseau</h1>
              <p className="type_machine">Linux</p>
              <p> Creation d'un serveur Web Linux et communication en SSH</p>
              <br></br>
          </div>

        <br /><br />
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

export default Myskill;
