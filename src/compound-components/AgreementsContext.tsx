import {
  ChangeEvent,
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
} from "react";

export type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

export type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;

export type AgreementsState = {
  [K in TermValue]: boolean;
};

export type AgreementsAction =
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

export const initialAgreements: AgreementsState = {
  isMoreThan14: false,
  privacy: false,
  termOfService: false,
  privacyThirdParty: false,
  marketing: false,
};

const updateAllAgreements = (draft: AgreementsState, payload: boolean) => {
  let key: TermValue;
  for (key in draft) {
    draft[key] = payload;
  }

  return draft;
};

const updateReset = (draft: AgreementsState) => {
  let key: TermValue;
  for (key in draft) {
    draft[key] = false;
  }

  return draft;
};

export const agreementsReducer = (
  draft: AgreementsState,
  action: AgreementsAction
) => {
  switch (action.type) {
    case "allAgreements":
      updateAllAgreements(draft, action.payload);
      break;
    case "reset":
      updateReset(draft);
      break;
    default:
      draft[action.type] = action.payload;
      break;
  }
};

export type AgreementsContextType = {
  /**
   * 동의 여부
   */
  agreements: AgreementsState;
  /**
   * 필수 값을 캐싱
   */
  cachedRequiredField: MutableRefObject<Set<TermValue>>;
  /**
   * 필수값을 `Set`으로 저장
   */
  requiredField: Set<TermValue>;
  /**
   * 필수값을 변경하는 함수
   */
  setRequiredField: Dispatch<SetStateAction<Set<TermValue>>>;
  /**
   * 전부 체크가 되었는지 확인하는 함수
   */
  isAllChecked: () => boolean;
  /**
   * 초기 마운트 시점에서 `required`가 설정된 `input`의 `name`을
   * `cachedRequiredField`, `requiredField`에 세팅.
   */
  initializeRequiredField: (name: TermValue, required?: boolean) => void;
  /**
   * 체크가 변화할 때마다 실행하는 함수
   */
  changeTermCheck: (
    e: ChangeEvent<HTMLInputElement>,
    required?: boolean
  ) => void;
  /**
   * 에러 메시지를 보여줄 때 사용하는 조건
   */
  isCheckedAllRequiredField: boolean;
  /**
   * 전부 초기화 하는 함수
   */
  reset: () => void;
};

const AgreementsContext = createContext<AgreementsContextType>({
  agreements: initialAgreements,
  cachedRequiredField: {
    current: new Set(),
  },
  requiredField: new Set(),
  setRequiredField: () => {},
  isAllChecked: () => false,
  initializeRequiredField: () => {},
  changeTermCheck: () => {},
  isCheckedAllRequiredField: false,
  reset: () => {},
});

export const useAgreementsContext = () => {
  const context = useContext(AgreementsContext);
  if (!context) {
    throw new Error(
      "This component must be used within a <Agreements> component."
    );
  }
  return context;
};

export default AgreementsContext;
