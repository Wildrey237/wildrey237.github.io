import Navbar from "./components/Navbar";


function Home() {
    const profile_photo = "https://cdn.discordapp.com/attachments/958463954206732298/1038050944971190282/Wilfried_NB.png"
  return (
    <main className="page">
      <section className="main">
          <article>
              <h1>Salut, je suis Wilfried, Etudiant en informatique</h1>
              <p className="type_machine"> En Bachelor 2e année à ECE Paris</p>
              <br /><br />
              <a className="green_empty_btn" href="/contact">Contactez-moi</a>
          </article>
        </section>
        <section>
            <img className={"img-profile"} src={profile_photo}/>
        </section>
      <div className="navbar_container">
        <Navbar/>
      </div>
      <div className="navbar_mobile_container">
        <Navbar/>
      </div>
    </main>
  );
}

export default Home;
