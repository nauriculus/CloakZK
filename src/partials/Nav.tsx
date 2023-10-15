import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const Nav = () => {
  return (
    <nav>
      <div className="content-wrapper navigation-bar">
        <a href="/">
          
        <img src="../home/binaramics.png"  className="nav--logo"/>

        </a>
        
      </div>
    </nav>
  );
};

export default Nav;
