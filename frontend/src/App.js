import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import About from "./pages/About";
import Error from "./pages/Error";
import Data from "./pages/Data";
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
        href="//fonts.googleapis.com/css?family=Monoton&amp;lang=en"
      />
      <Navbar />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/data" element={<Data />} />
          <Route path="/*" element={<Error />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
