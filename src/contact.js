import Navbar from "./components/Navbar";


function Contact() {
    const lien_logo_git = "https://cdn.discordapp.com/attachments/958463954206732298/1039216848895479838/pngegg.png"
    const lien_logo_link = "https://cdn.discordapp.com/attachments/958463954206732298/1038061605272952864/kisspng-computer-icons-linkedin-desktop-wallpaper-white-5abcebad15e7c5.1517199115223305410897.png"
    const lien_Profile_link = "https://www.linkedin.com/in/wilfried-bemelingue"
    return (
        <div className="page">
            <div className="main">
                <h1>Contact</h1>
                <p className="type_machine">Wilfriedbemelingue@gmail.com</p>
                <br /><br />
                <div>
                    <a href={lien_Profile_link}><img className={"logo"} src={lien_logo_link}/></a>
                    <a href={"google.com"}><img className={"logo"} src={lien_logo_git}/></a>
                </div>
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
