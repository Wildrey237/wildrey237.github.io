

function Navbar() {
    const logo = "https://cdn.discordapp.com/attachments/958463954206732298/1039670138556915803/Black_White_Minimalist_Elegant_Letter_Initial_Name_Monogram_Logo.png"
    return (
        <div className>
            <div className="div-logo">
                <img className={"img-logo"} src={logo}></img>
            </div>
            <ul>
                <li className="Navbar_element"><a href="/">About</a></li>
                <li className="Navbar_element"><a href="/myskills">MySkills</a></li>
                <li className="Navbar_element"><a href="/work">Work</a></li>
                <li className="Navbar_element"><a href="/contact">Contact</a></li>
            </ul>
        </div>
    );
}

export default Navbar;
