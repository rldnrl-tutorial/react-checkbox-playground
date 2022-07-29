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
  RequiredTerms,
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

  const checkRequiredField = (agreementName: RequiredTerms) => {
    setRequiredField((prevRequiredField) => {
      const newSet = new Set(prevRequiredField);
      newSet.delete(agreementName);
      return newSet;
    });
  };

  const uncheckRequiredField = (agreementName: RequiredTerms) => {
    setRequiredField((prevRequiredField) => {
      const newSet = new Set(prevRequiredField);
      newSet.add(agreementName);
      return newSet;
    });
  };

  const checkAllAgreement = () => {
    setRequiredField((prevRequiredField) => {
      const newSet = new Set(prevRequiredField);
      newSet.clear();
      return newSet;
    });
  };

  const changeTermCheck = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const agreementName = e.target.name as AgreementsAction["type"];
      const isRequired = e.target.required;

      const isCheckedRequiredField = isRequired && e.target.checked;
      const isUncheckedRequiredField = isRequired && !e.target.checked;

      if (isCheckedRequiredField) {
        checkRequiredField(agreementName as RequiredTerms);
      }

      if (isUncheckedRequiredField) {
        uncheckRequiredField(agreementName as RequiredTerms);
      }

      const isAllAgreement = agreementName === "allAgreements";

      const isCheckedAllAgreements = isAllAgreement && e.target.checked;
      const isUnCheckedAllAgreements = isAllAgreement && !e.target.checked;

      if (isCheckedAllAgreements) {
        checkAllAgreement();
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
