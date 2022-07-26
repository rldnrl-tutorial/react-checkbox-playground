import { ReactNode, useState } from "react";
import { useImmerReducer } from "use-immer";
import AgreementsContext, {
  agreementsReducer,
  initialAgreements,
  TermValue,
} from "./AgreementsContext";

type AgreementsProps = {
  children?: ReactNode;
  name?: string;
};

export default function Agreements({ children, name }: AgreementsProps) {
  const [requiredField, setRequiredField] = useState<Set<TermValue>>(
    new Set<TermValue>(["isMoreThan14", "termOfService", "privacy"])
  );

  const [state, dispatch] = useImmerReducer(
    agreementsReducer,
    initialAgreements
  );

  const isAllChecked = () => {
    let key: TermValue;
    for (key in state) {
      if (!state[key]) {
        return false;
      }
    }
    return true;
  };

  const reset = () => dispatch({ type: "reset" });

  return (
    <AgreementsContext.Provider
      value={{
        agreements: state,
        requiredField,
        setRequiredField,
        isAllChecked,
        changeTermCheck: dispatch,
        reset,
      }}
    >
      {children}
    </AgreementsContext.Provider>
  );
}
