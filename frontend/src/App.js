import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Error from "./pages/Error";
import Vote from "./pages/Vote";
import Privacy from "./pages/Privacy";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "../src/styles/App.css";

function App() {
  return (
    <div id="Body">
      <link
        rel="stylesheet"
        href="//fonts.googleapis.com/css?family=Quicksand&amp;lang=en"
      />
      <link
        rel="stylesheet"
        href="//fonts.googleapis.com/css?family=Montserrat&amp;lang=en"
      />
      <link
        rel="stylesheet"
        href="//fonts.googleapis.com/css?family=Major+Mono+Display&amp;lang=en"
      />
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/*" element={<Error />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
