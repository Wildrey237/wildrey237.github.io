import Navbar from "./components/Navbar";


function App() {
  return (
    <div className="page">

      <div className="main">
          <h1>Salut-Salut, je suis Wilfried, développeur web</h1>
          <p className="type_machine">Développeur backend | Python | pHp</p>
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

export default App;
