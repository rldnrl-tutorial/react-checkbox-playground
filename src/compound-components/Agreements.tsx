import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const cachedRequiredField = useRef<Set<TermValue>>(new Set<TermValue>());
  const [requiredField, setRequiredField] = useState<Set<TermValue>>(
    new Set<TermValue>()
  );

  const initializeRequiredField = (name: TermValue, required = false) => {
    if (required) {
      setRequiredField((prevSet) => {
        const newSet = new Set<TermValue>(prevSet);
        newSet.add(name);
        return newSet;
      });
      cachedRequiredField.current.add(name);
    }
  };

  const [state, dispatch] = useImmerReducer(
    agreementsReducer,
    initialAgreements
  );

  const changeTermCheck = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const agreementName = e.target.name as AgreementsAction["type"];

      const isCheckedRequiredField = e.target.required && e.target.checked;
      const isUncheckedRequiredField = e.target.required && !e.target.checked;

      if (isCheckedRequiredField) {
        setRequiredField((prevRequiredField) => {
          const newSet = new Set(prevRequiredField);
          newSet.delete(agreementName as TermValue);
          return newSet;
        });
      }

      if (isUncheckedRequiredField) {
        setRequiredField((prevRequiredField) => {
          const newSet = new Set(prevRequiredField);
          newSet.add(agreementName as TermValue);
          return newSet;
        });
      }

      const isCheckedAllAgreements =
        agreementName === "allAgreements" && e.target.checked;
      const isUnCheckedAllAgreements =
        agreementName === "allAgreements" && !e.target.checked;

      if (isCheckedAllAgreements) {
        setRequiredField((prevRequiredField) => {
          const newSet = new Set(prevRequiredField);
          newSet.clear();
          return newSet;
        });
      }

      if (isUnCheckedAllAgreements) {
        setRequiredField(cachedRequiredField.current);
      }

      dispatch({
        type: e.target.name as AgreementsAction["type"],
        payload: e.target.checked,
      });
    },
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

  const isCheckedAllRequiredField = useMemo(
    () => requiredField.size === 0,
    [requiredField]
  );

  return (
    <AgreementsContext.Provider
      value={{
        agreements: state,
        cachedRequiredField,
        requiredField,
        setRequiredField,
        initializeRequiredField,
        isAllChecked,
        changeTermCheck,
        isCheckedAllRequiredField,
        reset,
      }}
    >
      {children}
    </AgreementsContext.Provider>
  );
}
