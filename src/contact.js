import Navbar from "./components/Navbar";


function Contact() {
    return (
        <div className="page">
            <div className="main">
                <h1>Salut, je suis Wilfried, Etudiant en Informatique</h1>
                <p className="type_machine"> En Bachelor 2e année à ECE Paris</p>
                <br /><br />

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

export default Contact;
