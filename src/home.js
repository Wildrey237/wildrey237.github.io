import Navbar from "./components/Navbar";


function Home() {
  return (
    <div className="page">
      <div className="main">
          <h1>Salut, je suis Wilfried, Etudiant en informatique</h1>
          <p className="type_machine"> En Bachelor 2e année à ECE Paris</p>
          <br /><br />
          <a className="green_empty_btn" href="/">Contactez-moi</a>

        </div>
        <div>
            <img src=""/>
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

export default Home;
