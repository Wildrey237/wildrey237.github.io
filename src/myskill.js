import Navbar from "./components/Navbar";


function Myskill() {
  return (
    <div className="page">

      <div className="main">
          <h1>Programation</h1>
          <p className="type_machine">Php,</p><br></br>
          <p className="type_machine">Python,</p><br></br>
          <p className="type_machine">Java,</p><br></br>
          <p className="type_machine">Javascript,</p><br></br>
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

export default Myskill;
