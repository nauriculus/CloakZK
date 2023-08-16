import "./Home.css";
import Nav from "./partials/Nav";
import Footer from "./partials/Footer";
import Main from "./main";

const Home = () => {
  
  return(
  <main>
      <section id="mainContent">
        <header className="header header-home-hero">
          <Nav />
        </header>

      </section>

      <section className="content-wrapper">
        <Main />
      </section>

    

      <Footer />
    </main>
  );
};

export default Home;
