import { Link, Route, Routes } from "react-router-dom";
import Terms from "./components/Terms";
import TermsWithMap from "./components/TermsMap";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="array" element={<Terms />} />
        <Route path="map" element={<TermsWithMap />} />
      </Routes>
    </>
  );
}

function Home() {
  return (
    <ul>
      <li>
        <Link to="/array">React Checkbox Array</Link>
      </li>
      <li>
        <Link to="/map">React Checkbox Map</Link>
      </li>
    </ul>
  );
}
