import Navbar from "./components/Navbar";


function Home() {
  return (
    <div className="page">
      <div className="main">
          <h1>Salut, je suis Wilfried, Etudiant en informatique</h1>
          <p className="type_machine"> En Bachelor 2e année à ECE Paris</p>
          <br /><br />
          <input type={"button"} className="green_empty_btn" value={"Contactez-moi"} />

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
