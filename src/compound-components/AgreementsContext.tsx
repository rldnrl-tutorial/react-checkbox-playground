import { createContext, useContext } from "react";

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;

type AgreementsContextType = {
  agreements: {
    [K in TermValue]: boolean;
  };
  allAgreements: boolean;
  validateRequired: boolean;
  onTermChange: () => void;
  reset: () => void;
};

const initialAgreements = {
  isMoreThan14: false,
  privacy: false,
  termOfService: false,
  privacyThirdParty: false,
  marketing: false,
};

const AgreementsContext = createContext<AgreementsContextType>({
  agreements: initialAgreements,
  allAgreements: false,
  validateRequired: false,
  onTermChange: () => {},
  reset: () => {},
});

export const useAgreementsContext = () => useContext(AgreementsContext);

export default AgreementsContext;
