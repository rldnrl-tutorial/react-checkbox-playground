import React from "react";
import { useImmer } from "use-immer";

import useTerm, { Action, TermIndex } from "../hooks/useTerms";

export default function Terms() {
  const {
    IS_MORE_THAN14,
    TERM_OF_SERVICE,
    PRIVACY,
    PRIVACY_THIRD_PARTY,
    MARKETING,
  } = TermIndex;

  const { agreements, allAgreements, onTermChange, validateRequired, reset } =
    useTerm();

  const [state, setState] = useImmer({
    errorMessageOfTerms: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const newTerms = agreements.map((agreement) =>
      agreement.value === name ? { ...agreement, checked } : agreement
    );

    const isCheckedAllAgreements = name === "allAgreements" && checked;
    const isUncheckedAllAgreements = name === "allAgreements" && !checked;

    const isErrorMessage =
      (validateRequired(newTerms) || isCheckedAllAgreements) &&
      !isUncheckedAllAgreements;

    setState((d) => {
      d.errorMessageOfTerms = isErrorMessage ? "" : "필수값에 동의 해주세요.";
    });

    onTermChange(name as Action["type"], checked);
  };

  return (
    <div className="App">
      <h1>React Select</h1>
      <ul>
        <li>
          <input
            type="checkbox"
            id="allAgreements"
            name="allAgreements"
            checked={allAgreements}
            onChange={onChange}
          />
          <label htmlFor="allAgreements">전체동의</label>
        </li>
        <li>
          <input
            type="checkbox"
            id="isMoreThan14"
            name="isMoreThan14"
            checked={agreements[IS_MORE_THAN14].checked}
            onChange={onChange}
          />
          <label htmlFor="isMoreThan14">14세 이상</label>
        </li>
        <li>
          <input
            type="checkbox"
            id="termOfService"
            name="termOfService"
            checked={agreements[TERM_OF_SERVICE].checked}
            onChange={onChange}
          />
          <label htmlFor="termOfService">이용 약관</label>
        </li>
        <li>
          <input
            type="checkbox"
            id="privacy"
            name="privacy"
            checked={agreements[PRIVACY].checked}
            onChange={onChange}
          />
          <label htmlFor="privacy">개인 정보</label>
        </li>
        <li>
          <input
            type="checkbox"
            id="privacyThirdParty"
            name="privacyThirdParty"
            checked={agreements[PRIVACY_THIRD_PARTY].checked}
            onChange={onChange}
          />
          <label htmlFor="privacyThirdParty">제 3자 개인 정보 제공</label>
        </li>
        <li>
          <input
            type="checkbox"
            id="marketing"
            name="marketing"
            checked={agreements[MARKETING].checked}
            onChange={onChange}
          />
          <label htmlFor="marketing">마케팅 수신</label>
        </li>
      </ul>
      <p>{state.errorMessageOfTerms}</p>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
