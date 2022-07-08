import { useReducer } from "react";

export const TermIndex = {
  IS_MORE_THAN14: 0,
  TERM_OF_SERVICE: 1,
  PRIVACY: 2,
  PRIVACY_THIRD_PARTY: 3,
  MARKETING: 4,
} as const;

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms =  "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms

export type Term = {
  value: TermValue;
  checked: boolean;
  required: boolean;
};

export type Action =
  | {
      type: "allAgreements";
      payload: boolean;
    }
  | {
      type: "isMoreThan14";
      payload: boolean;
    }
  | {
      type: "termOfService";
      payload: boolean;
    }
  | {
      type: "privacy";
      payload: boolean;
    }
  | {
      type: "privacyThirdParty";
      payload: boolean;
    }
  | {
      type: "marketing";
      payload: boolean;
    }
  | {
      type: "reset";
    };

type State = Term[];

const initialState: State = [
  {
    value: "isMoreThan14",
    checked: false,
    required: true,
  },
  {
    value: "termOfService",
    checked: false,
    required: true,
  },
  {
    value: "privacy",
    checked: false,
    required: true,
  },
  {
    value: "privacyThirdParty",
    checked: false,
    required: false,
  },
  {
    value: "marketing",
    checked: false,
    required: false,
  },
];

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "allAgreements":
      return state.map((agreement) => ({
        ...agreement,
        checked: action.payload,
      }));
    case "reset":
      return state.map((agreement) => ({ ...agreement, checked: false }));
    default:
      return state.map((agreement) =>
        agreement.value === action.type
          ? { ...agreement, checked: action.payload }
          : agreement
      );
  }
};

const useTerms = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onTermChange = (name: Action["type"], checked: boolean) =>
    dispatch({ type: name, payload: checked });

  const allAgreements =
    state.filter((agreemenet) => !agreemenet.checked).length < 1;

  const validateRequired = (terms: State) =>
    terms
      .filter((agreement) => agreement.required)
      .every((agreement) => agreement.checked);

  const reset = () => dispatch({ type: "reset" });

  return {
    agreements: state,
    allAgreements,
    onTermChange,
    validateRequired,
    reset,
  };
};

export default useTerms;
