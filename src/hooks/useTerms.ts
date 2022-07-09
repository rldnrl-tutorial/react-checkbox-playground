import { useReducer } from "react";

export const TermIndex = {
  IS_MORE_THAN14: 0,
  TERM_OF_SERVICE: 1,
  PRIVACY: 2,
  PRIVACY_THIRD_PARTY: 3,
  MARKETING: 4,
} as const;

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;

export type Term = {
  value: TermValue;
  checked: boolean;
  required: boolean;
};

export type Action =
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

const updateAllAgreements = (state: State, payload: boolean) =>
  state.map((agreement) => ({
    ...agreement,
    checked: payload,
  }));

const updateReset = (state: State) =>
  state.map((agreement) => ({ ...agreement, checked: false }));

type UpdateByTermParams = {
  state: State;
  type: TermValue;
  payload: boolean;
};

type UpdateByTermValue = (params: UpdateByTermParams) => State;

const updateByTermValue: UpdateByTermValue = ({ state, type, payload }) =>
  state.map((agreement) =>
    agreement.value === type ? { ...agreement, checked: payload } : agreement
  );

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "allAgreements":
      return updateAllAgreements(state, action.payload);
    case "reset":
      return updateReset(state);
    default:
      return updateByTermValue({
        state,
        type: action.type,
        payload: action.payload,
      });
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
