import { ChangeEvent, ReactNode, useCallback, useState } from "react";
import { useImmerReducer } from "use-immer";

import AgreementsContext, {
  AgreementsAction,
  agreementsReducer,
  initialAgreements,
  TermValue,
} from "./AgreementsContext";

type AgreementsProps = {
  children?: ReactNode;
};

export default function Agreements({ children }: AgreementsProps) {
  const [requiredField, setRequiredField] = useState<Set<TermValue>>(
    new Set<TermValue>()
  );

  const [state, dispatch] = useImmerReducer(
    agreementsReducer,
    initialAgreements
  );

  const changeTermCheck = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      dispatch({
        type: e.target.name as AgreementsAction["type"],
        payload: e.target.checked,
      }),
    [dispatch]
  );

  const isAllChecked = useCallback(() => {
    let key: TermValue;
    for (key in state) {
      if (!state[key]) {
        return false;
      }
    }
    return true;
  }, [state]);

  const reset = useCallback(() => dispatch({ type: "reset" }), [dispatch]);

  return (
    <AgreementsContext.Provider
      value={{
        agreements: state,
        requiredField,
        setRequiredField,
        isAllChecked,
        changeTermCheck,
        reset,
      }}
    >
      {children}
    </AgreementsContext.Provider>
  );
}
