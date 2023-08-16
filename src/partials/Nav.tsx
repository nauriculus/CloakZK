import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav>
      <div className="content-wrapper navigation-bar">
        <a href="/">
          
        <img className="nav--logo" src="../home/binaramics.png" 
        style={{ width: '60px', height: 'auto', transform: 'translate(20px, -12px)' }} />

        </a>
        <div className="is-flex nav-main--wrapper">
          <input type="checkbox" className="menu-trigger" />
          <div className="menu-trigger--wrapper">
          <div className="nav-main--menu-label" style={{ color: '#FFF' }}>
          MENU
        </div>
        </div>
          <ul className="nav-main">
            <li>
            <Link to="/otc" className="link">
              OTC Trading
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
