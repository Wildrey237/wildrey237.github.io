import Navbar from "./components/Navbar";
import {useState} from "react";


function Home() {
    const profile_photo = "https://lh3.googleusercontent.com/pw/AP1GczMBWTBVgcCV0aaZbJVUvS_h7V28MQ1KCHKhwXKsjnws_y5DFuAFg4z1Ceqgf0sP0Zfhf5WI41ovzqNaVM0wo247YHJKa19ZOywXhxxpeKfWAOQt3e98ouYP6FZc6hFEa2j8K_FFD-KHGjqpX5jxhrz29rQjMFA1gZ5u-eaGv_-V7oGw2PydWCn9-2zqOTlTNPxy_cCWeUcqf1NYLLH07DLLTpOJiePXlzNbLKSHSjf_AKvlA7sV7uvCkd9CI1TcLsc59wmOvIBVnWqCkGoduc7UEvExkV4pS8sIIKNPnvWcgjY07rLqcZ5aFiqdcvtX6mtPB6dG5eBclTkF3HHrGu2Mjc7l93APgpbvMLzy2l-5Xt1Egu8kfg4GLMk1m7sB0Thd1BNmY15FLu3AujInH28YElQ2xykm8EYA1cxA1JXEa3vzY0yAY4KvwVPguwrxMTXYTp7C-c950LoKEWsEdAfiHW6z5PKIk627dYGoJH83djFiLRbHSv9Ian0zdH_nI8hmVCltsdIa7vpZrpKXB5nU3aJz0VPSTKKdTYxsk6yUkR1u9coN0DpVPTgfjPb4nEjBjeFfOFhQqu6UZWIa0Z3L60Ay1eOGWVFhMqewd8A5G1rhWSuZAWO6elk8XTcEQcrYbZsTtgPE0wQYa6BjbxTUjghbHHWxRzXnRghEjCZL9DUKgID85uxVCJ-87WVPmAYwO7xiTgOrjHX9rCj4HBtpRRDG7j0grFZwbCmIZ3OjzZQztcVCnDomySA2CmXw9eBL6ro34R6ZEV9S-FSf4QlTcKiidR_ndqZBFXT2i2Aj8BOPdLdQAjkgE-pjSH0W6xX7TGsGih1fUg5PDbLalpUIRTBX7DL2muUM6TOx1QLBQumYMUOh_tvtaA5wQf5QiCNYDHM59WYDUUadMRm0N5-RgYzJywIEmpwwMut2SkhNWSQW7NYHS7EVDy5N6w=w728-h970-s-no-gm?authuser=0"
    const cv ="https://cdn.discordapp.com/attachments/958463954206732298/1043907012834099260/CV_ECOLE.pdf"
    const [navbar, setNavbar] = useState(true);
    const [navbarMobile, setNavbarMobile] = useState(true);
  return (
    <main className="page-home">
      <section className="main-home">
          <article className={"article-home"}>
              <h1 className={"h1-home"}>Salut, je suis Wilfried Etudiant en ingenieurie informatique</h1>
              <h2 className={"h2-home"}>En 1er année de classe d'ingenieur à EPITA</h2>
              <p className={"type_machine"}>Je suis à la recherche d'un stage de 6 mois dans la data et l'intelligence artificielle</p>
              <br /><br />
              <div className={"btn-Contact"}>
                  <a href={"/contact"}><input type={"button"} className={"green_empty_btn"} value={"Contactez-moi"}/></a> <a href={cv}> <input type={"button"} className={"green_empty_btn"} value={"Uploader mon CV"}/> </a>
              </div>
          </article>
          <article className={"article-photo"}>
              <img className={"img-profile"} src={profile_photo}/>
          </article>
        </section>
        <div className={"navbar_container"}>
        <Navbar/>
      </div>
        <div className={"navbar-bottom"}>
            {navbar ? (
                    <div onClick={()=>{
                        setNavbar(false);
                    }
                    }>Navbar</div>
                    ) : (
                        <div className={"navbar_mobile_container"}>
                            <div onClick={()=>{
                                setNavbar(true);
                            }
                            }>Close</div>
                            <Navbar/>
                        </div>) }
        </div>
    </main>
  );
}

export default Home;
