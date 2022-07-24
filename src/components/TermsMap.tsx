import React from "react";
import { useImmer } from "use-immer";

import useTermsMap, { Action, TermValue } from "../hooks/useTermsMap";

type TermInput = {
  name: TermValue;
  checked: boolean | undefined;
  label: string;
  required: boolean;
};

export default function TermsWithMap() {
  const { agreements, isAllChecked, onTermChange, reset } = useTermsMap();

  const termInputs: TermInput[] = [
    {
      name: "isMoreThan14",
      checked: agreements.get("isMoreThan14"),
      label: "14세 이상",
      required: true,
    },
    {
      name: "termOfService",
      checked: agreements.get("termOfService"),
      label: "이용약관",
      required: true,
    },
    {
      name: "privacy",
      checked: agreements.get("privacy"),
      label: "개인정보 제공",
      required: true,
    },
    {
      name: "privacyThirdParty",
      checked: agreements.get("privacyThirdParty"),
      label: "제 3자 개인정보 제공",
      required: false,
    },
    {
      name: "marketing",
      checked: agreements.get("marketing"),
      label: "마케팅",
      required: false,
    },
  ];

  const [state, setState] = useImmer({
    errorMessageOfTerms: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const newTerms = Array.from(agreements.entries()).map(([key, value]) =>
      key === name ? [key, checked] : [key, value]
    );

    const isCheckedAllAgreements = name === "allAgreements" && checked;
    const isUncheckedAllAgreements = name === "allAgreements" && !checked;
    const requiredFieldsInput = termInputs.filter(({ required }) => required);
    const requiredFieldsMap = newTerms.filter(([key]) => {
      for (const field of requiredFieldsInput) {
        if (field.name === key) {
          return true;
        }
      }
      return false;
    });
    const isRequiredChecked = requiredFieldsMap.every(([_, value]) => value);

    const isErrorMessage =
      (isRequiredChecked || isCheckedAllAgreements) &&
      !isUncheckedAllAgreements;

    setState((d) => {
      d.errorMessageOfTerms = isErrorMessage ? "" : "필수값에 동의 해주세요.";
    });

    onTermChange(name as Action["type"], checked);
  };

  return (
    <div className="App">
      <h1>React Checkbox Map Datastructure</h1>
      <ul>
        <li>
          <input
            type="checkbox"
            id="allAgreements"
            name="allAgreements"
            checked={isAllChecked}
            onChange={onChange}
          />
          <label htmlFor="allAgreements">전체동의</label>
        </li>
        {termInputs.map(({ name, checked, label }) => (
          <li key={name}>
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={checked}
              onChange={onChange}
            />
            <label htmlFor={name}>{label}</label>
          </li>
        ))}
      </ul>
      <p>{state.errorMessageOfTerms}</p>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
