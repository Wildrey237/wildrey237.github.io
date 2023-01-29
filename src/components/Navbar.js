import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

function Navbar() {
    const logo = "https://cdn.discordapp.com/attachments/958463954206732298/1039670138556915803/Black_White_Minimalist_Elegant_Letter_Initial_Name_Monogram_Logo.png"
    const lien_logo_git = "https://cdn.discordapp.com/attachments/958463954206732298/1039216848895479838/pngegg.png"
    const lien_logo_link = "https://cdn.discordapp.com/attachments/958463954206732298/1038061605272952864/kisspng-computer-icons-linkedin-desktop-wallpaper-white-5abcebad15e7c5.1517199115223305410897.png"
    const lien_Profile_link = "https://www.linkedin.com/in/wilfried-bemelingue"
    const Lien_github = "https://github.com/Wildrey237";
    const Lien_logo_menu ="https://cdn-icons-png.flaticon.com/512/55/55003.png";
    return (
        <div className={'navbar'}>
            <div className="div-logo">
                <a href="/"><img className={"img-logo"} src={logo}></img></a>
            </div>
            <ul>
                <li className="Navbar_element"><Link to="/">About</Link></li>
                <li className="Navbar_element"><Link to="/myskills">MySkills</Link></li>
                <li className="Navbar_element"><Link to="/work">Work</Link></li>
                <li className="Navbar_element"><Link to="/contact">Contact</Link></li>
            </ul>
            <div className={"div-logo"}>
                <a href={lien_Profile_link}><img className={"logo-navbar"} src={lien_logo_link}/></a>
                <a href={Lien_github}><img className={"logo-navbar"} src={lien_logo_git}/></a>
            </div>
            <div className={"icon-menu"}><img src={Lien_logo_menu}></img> </div>
        </div>
    );
}

export default Navbar;
