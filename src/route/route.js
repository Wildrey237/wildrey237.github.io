import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Routes,
} from 'react-router-dom'
import Myskill from '../myskill';
import Home from "../home";
import Work from "../work";
import Contact from "../contact";


function Redirection(){
    return (
      <Router>
          <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/myskills" element={<Myskill />} />
                <Route path="/work" element={<Work />} />
                <Route path="/contact" element={<Contact />} />
          </Routes>
      </Router>
    );
}

export default Redirection;