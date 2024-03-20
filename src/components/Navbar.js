import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

function Navbar() {
    // TODO: Add the links for my personnal Logo
    const logo = "https://lh3.googleusercontent.com/pw/AP1GczNlJ6VpG1Rs-2Acn8VJOfS8x3SIkQoQCxdlqZPhdQX0YbdddWHfj7XjJ2ZTCun4U3JV4QnrG2eOj5R1wDzFikyDmh23g62N7cGeerMs5DZGAKCpw_jchFal5ICRSCceVJ_3a2GmWGsF6zqGDNBvQzGVIPPUoWB3r5IxlhAqheAgm5_x1pzESW7XoOZDBITPWxL9QRQu5ZQGx31HPPS8ZabDztWNsgsWknxkleAfovhX0zcv4n3yhxCjiIq3vWZYfZxvxYxzHre-g-qHFlXQAEMqtJvpBJiy-zyHdRBeGHR4sRcE3hzVGfRuRbZ-esNmI44lKbEk_qgVLKzbJubq8OWrEfy05Qz7Jc-S8oxdzGvCAlgM3-WLAh_3zJ_aLN8HXz5kQi0125zUDVNJvscIt6bjjLrWN7pc7mZYRQ1U7jKoKDujzWslRrSwRfJM2CxURQtj0AqUQ-q2I8oFtrarMYHnkg3uRO9gYnWckElotdezEvI7TQogR3m3gZjnSjVuYlYsGKwYBrHiqNikU8oLXRX4JtgkGCeFpzBWeWbPbCriPB1pNXncrIqKvy9XtCUae2Cn6geRkkejymmMhuieOoCsKn1-lNiZTVSCeGFKSMkm84kUsFmJKJOHf7pSYmJAaT5KiIhsZ6us070WMQax9ooElRCX0ztb_4rXl9OUJ5_AyuV2AwOHIaBznbmiIN8GGukuVUgK5ZDxXgtIz05hRvULy-WcyFJB53wcW7vXOaC9IYR2ppu07XnNh7_6pJbYMGQ6KVEdN1LFD0ndglDC7jX7rZmj5CrzshsV8FNkssczMoPdoMJzakE9YHmc54DanAqb4wbIsjIQy5uxHfJO3S02qFi1eRTJj0qiJiHSMcZW3K8XoXoE0gwpNvGVc1CBxdj9vrYcCnJh1rxPqckXyYzX9KuZnKHh4TPHT1k_gagOi_J9JY0D_Fo6PgrtPw=w270-h270-s-no-gm?authuser=0"
    const lien_logo_git = "https://cdn.icon-icons.com/icons2/2429/PNG/512/github_logo_icon_147285.png"
    const lien_logo_link = "https://blog.waalaxy.com/wp-content/uploads/2021/01/logo-linkedin-blanc.png"
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
            {/*TODO: Add the space between the icon anf link*/}
            <div className={"div-logo"}></div>
            <div className={"div-logo"}>
                <a href={lien_Profile_link}><img className={"logo-navbar"} src={lien_logo_link}/></a>
                <a href={Lien_github}><img className={"logo-navbar"} src={lien_logo_git}/></a>
            </div>
            <div className={"icon-menu"}><img src={Lien_logo_menu}></img> </div>
        </div>
    );
}

export default Navbar;
