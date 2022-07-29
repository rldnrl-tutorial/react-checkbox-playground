import { InputHTMLAttributes, useMemo } from "react";
import useMountEffect from "../hooks/ussMountEffect";
import { TermValue, useAgreementsContext } from "./AgreementsContext";

type AgreementCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "id"
> & {
  htmlFor: TermValue | "allAgreements";
  id: TermValue | "allAgreements";
  name: TermValue | "allAgreements";
};

export default function AgreementCheckbox(props: AgreementCheckboxProps) {
  const { agreements, isAllChecked, initializeRequiredField, changeTermCheck } =
    useAgreementsContext();

  useMountEffect(() => {
    initializeRequiredField(props.name as TermValue, props.required);
  });

  const checked = useMemo(() => {
    switch (props.name) {
      case "allAgreements":
        return isAllChecked();
      default:
        return agreements[props.name as TermValue];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreements, isAllChecked]);

  return (
    <div>
      <input
        type="checkbox"
        id={props.name}
        name={props.name}
        required={props.required}
        checked={checked}
        onChange={changeTermCheck}
      />
      <label htmlFor={props.htmlFor}>{props.children}</label>
    </div>
  );
}
