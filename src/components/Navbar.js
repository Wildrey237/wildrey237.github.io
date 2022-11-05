

function Navbar() {
    return (
        <div className>
            <div className="logo">
                <p className="logo_fount">W/B</p>
                {/*<img src="https://cdn.discordapp.com/attachments/958463954206732298/1038050944971190282/Wilfried_NB.png"></img>*/}
            </div>
            <ul>
                <li className="Navbar_element"><a href="">About</a></li>
                <li className="Navbar_element"><a href="/myskills">MySkills</a></li>
                <li className="Navbar_element"><a href="/work">Work</a></li>
                <li className="Navbar_element"><a href="/contact">Contact</a></li>
            </ul>
        </div>
    );
}

export default Navbar;
