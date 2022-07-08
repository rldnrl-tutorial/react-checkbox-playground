import { useReducer } from "react";

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;

export type State = Map<TermValue, boolean>;

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

const initialState: State = new Map<TermValue, boolean>([
  ["isMoreThan14", false],
  ["termOfService", false],
  ["privacy", false],
  ["privacyThirdParty", false],
  ["marketing", false],
]);

const udpateAllAgreements = (state: State, payload: boolean) => {
  const result = new Map(state);

  result.forEach((_, key) => {
    result.set(key, payload);
  });

  return result;
};

const updateReset = (state: State) => {
  const result = new Map(state);

  result.forEach((_, key) => {
    result.set(key, false);
  });

  return result;
};

type UpdateTermParams = {
  name: TermValue;
  state: State;
  payload: boolean;
};

type UpdateTerm = (params: UpdateTermParams) => State;

const updateTerm: UpdateTerm = ({ name, state, payload }) => {
  const result = new Map(state);

  result.forEach((_, key) => {
    if (name === key) {
      result.set(key, payload);
    }
  });

  return result;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "allAgreements":
      return udpateAllAgreements(state, action.payload);
    case "reset":
      return updateReset(state);
    default:
      return updateTerm({ name: action.type, state, payload: action.payload });
  }
};

const checkAllAgreements = (state: State) => {
  return Array.from(state.values()).every((checked) => checked);
};

const useTermsWithObject = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onTermChange = (name: Action["type"], checked: boolean) =>
    dispatch({ type: name, payload: checked });

  const isAllChecked = checkAllAgreements(state);

  const reset = () => dispatch({ type: "reset" });

  return {
    agreements: state,
    isAllChecked,
    onTermChange,
    reset,
  };
};

export default useTermsWithObject;
