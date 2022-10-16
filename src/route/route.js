import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Routes,
} from 'react-router-dom'
import Myskill from '../myskill';
import './App.css';
import Home from '../home';


function Route () {
    return (
      <Router>
          <Routes>
                <Route exact path="/" component={Home} />
                <Route path="/myskills" component={Myskill} />
          </Routes>
      </Router>
    );
}

export default Route;