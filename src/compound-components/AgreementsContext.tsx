import {
  ChangeEvent,
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;

export type AgreementsState = {
  isMoreThan14: boolean;
  privacy: boolean;
  termOfService: boolean;
  privacyThirdParty: boolean;
  marketing: boolean;
};

export type AgreementsAction =
  | {
      type: TermValue;
      payload: boolean;
    }
  | {
      type: "allAgreements";
      payload: boolean;
    }
  | {
      type: "reset";
    };

export const initialAgreements: AgreementsState = {
  isMoreThan14: false,
  privacy: false,
  termOfService: false,
  privacyThirdParty: false,
  marketing: false,
};

const updateAllAgreements = (draft: AgreementsState, payload: boolean) => {
  let key: TermValue;
  for (key in draft) {
    draft[key] = payload;
  }

  return draft;
};

const updateReset = (draft: AgreementsState) => {
  let key: TermValue;
  for (key in draft) {
    draft[key] = false;
  }

  return draft;
};

export const agreementsReducer = (
  draft: AgreementsState,
  action: AgreementsAction
) => {
  switch (action.type) {
    case "allAgreements":
      updateAllAgreements(draft, action.payload);
      break;
    case "reset":
      updateReset(draft);
      break;
    default:
      draft[action.type] = action.payload;
      break;
  }
};

export type AgreementsContextType = {
  agreements: {
    [K in TermValue]: boolean;
  };
  requiredField: Set<TermValue>;
  setRequiredField: Dispatch<SetStateAction<Set<TermValue>>>;
  isAllChecked: () => boolean;
  changeTermCheck: (
    e: ChangeEvent<HTMLInputElement>,
    required?: boolean
  ) => void;
  reset: () => void;
};

const AgreementsContext = createContext<AgreementsContextType>({
  agreements: initialAgreements,
  requiredField: new Set(),
  setRequiredField: () => {},
  isAllChecked: () => false,
  changeTermCheck: () => {},
  reset: () => {},
});

export const useAgreementsContext = () => useContext(AgreementsContext);

export default AgreementsContext;
