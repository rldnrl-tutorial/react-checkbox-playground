import {
  ChangeEvent,
  createContext,
  Dispatch,
  MutableRefObject,
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
  cachedRequiredField: MutableRefObject<Set<TermValue>>;
  requiredField: Set<TermValue>;
  setRequiredField: Dispatch<SetStateAction<Set<TermValue>>>;
  isAllChecked: () => boolean;
  initializeRequiredField: (name: TermValue, required?: boolean) => void;
  changeTermCheck: (
    e: ChangeEvent<HTMLInputElement>,
    required?: boolean
  ) => void;
  isCheckedAllRequiredField: boolean;
  reset: () => void;
};

const AgreementsContext = createContext<AgreementsContextType>({
  agreements: initialAgreements,
  cachedRequiredField: {
    current: new Set(),
  },
  requiredField: new Set(),
  setRequiredField: () => {},
  isAllChecked: () => false,
  initializeRequiredField: () => {},
  changeTermCheck: () => {},
  isCheckedAllRequiredField: false,
  reset: () => {},
});

export const useAgreementsContext = () => {
  const context = useContext(AgreementsContext);
  if (!context) {
    throw new Error(
      "This component must be used within a <Agreements> component."
    );
  }
  return context;
};

export default AgreementsContext;
