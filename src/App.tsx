import { Link, Route, Routes } from "react-router-dom";
import Terms from "./components/Terms";
import TermsWithMap from "./components/TermsMap";
import AgreementCheckbox from "./compound-components/AgreementCheckbox";
import Agreements from "./compound-components/Agreements";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="array" element={<Terms />} />
        <Route path="map" element={<TermsWithMap />} />
        <Route
          path="compound-component"
          element={
            <Agreements>
              <AgreementCheckbox
                htmlFor="allAgreements"
                id="allAgreements"
                name="allAgreements"
              >
                전체 선택
              </AgreementCheckbox>
              <AgreementCheckbox
                htmlFor="isMoreThan14"
                id="isMoreThan14"
                name="isMoreThan14"
                required
              >
                14세 이상
              </AgreementCheckbox>
              <AgreementCheckbox
                htmlFor="termOfService"
                id="termOfService"
                name="termOfService"
                required
              >
                이용 약관 동의
              </AgreementCheckbox>
              <AgreementCheckbox
                htmlFor="privacy"
                id="privacy"
                name="privacy"
                required
              >
                개인정보 제공 동의
              </AgreementCheckbox>
              <AgreementCheckbox
                htmlFor="privacyThirdParty"
                id="privacyThirdParty"
                name="privacyThirdParty"
              >
                제 3자 개인정보 제공 동의
              </AgreementCheckbox>
              <AgreementCheckbox
                htmlFor="marketing"
                id="marketing"
                name="marketing"
              >
                마케팅
              </AgreementCheckbox>
            </Agreements>
          }
        ></Route>
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
      <li>
        <Link to="/compound-component">React Checkbox Compound Component</Link>
      </li>
    </ul>
  );
}
