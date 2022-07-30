# React Checkbox
## Motivation
- 기존 코드가 하드 코딩되어 있어서 로직을 바꿔보자.
- 약관 페이지는 변경될 가능성이 있으니, 로직을 따로 분리해보자.

## 기존 코드
```tsx
const [agreements, setAgreements] = useState([false, false, false, false, false])
```

- 업데이트하는 로직도 하드코딩 되어있었다.
- 에러 로직 처리하는 부분이 아주 이상하게 조건이 많았다.

## `useState` 대신 `useReducer`를 사용한 이유
- 업데이트 로직을 분리하는 것이 로직을 이해하는 데 더 좋을 것으로 생각
- 약관이 추가되거나 삭제가되는 경우, `initialState`, `State`를 활용해 관리할 수 있음.
- 업데이트 로직을 분리해서 테스트하기 쉬움.

## 코드 설명

### `TermValue`

```ts
type TermValue =
  | "isMoreThan14"
  | "termOfService"
  | "privacy"
  | "privacyThirdParty"
  | "marketing";
```

- `TermValue` 타입은 약관을 나타내는 타입
- `input`의 `name`에 들어감.

### `Term`

```ts
type Term = {
  value: TermValue;
  checked: boolean;
  required: boolean;
};
```

- `Term`은 하나의 약관이 갖고 있는 필드
  - `value`: 약관을 구별해주는 역할
  - `checked`: 체크가 되어있는지 여부
  - `required`: 필수 여부

### `Action`

```ts
type Action =
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
```

- `Action`은 `TermValue`에 있는 것 외에 `allAgreements`와 `reset`이 있는데, 이것은 **전체 선택**과 **값을 초기화**하는 요구사항이 있기 때문.

### `State`

```ts
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
```
- `State` 타입은 `initialState`를 정의하는 역할
- `initialState`는 `reducer`에 넣을 초기값

### `reducer`

```ts
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "allAgreements":
      return state.map((agreement) => ({
        ...agreement,
        checked: action.payload,
      }));
    case "reset":
      return state.map((agreement) => ({ ...agreement, checked: false }));
    default:
      return state.map((agreement) =>
        agreement.value === action.type
          ? { ...agreement, checked: action.payload }
          : agreement
      );
  }
};
```

- `action.type` is
  - `allAgreements`: 모든 필드를 `action.payload`로 만들어준다.
  - `reset`: 모든 필드를 `false`로 만들어준다.
  - 기본적으로 `action.type`과 같은 필드를 찾아서 `action.payload`로 업데이트 해준다.

### `useTerms`

```ts
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
```

- `onTermChange`: `dispatch`를 이름만 바꿨다고 보면 됨
- `allAgreements`: 전체 선택에 관한 로직
  - 하나씩 눌러서 필드 전체의 `checked`가 `true`이면 체크가 된다.
  - 필드 전체의 `checked`가 `true`인 상태에서 하나라도 `false`가 되면 체크가 해제된다.
- `validateRequired`: `required`가 `true`인 필드는 전부 체크가 되어야한다.(`checked: true`)
- `reset`: 모든 필드의 `checked`를 초기화 시킨다.

## Compound Component Pattern

일단 위의 리팩토링한 것도 부족한 부분이 있습니다. `required`를 UI 단에서 관리하는 게 아니라 `state`에서 관리를 해준다는 점입니다. 요구사항이 바뀔 때마다 그 쪽을 추가해줘야합니다. 그래서 UI에서 `required`라는 `Props`를 추가만 하면 자동으로 추가되는 방향으로 작업을 생각했습니다. 이전에 배웠던 compound component pattern을 활용해서 말이죠.

먼저 `Agreements Context` 만들어봅시다. `Context`와 `Provider`를 따로 만드는 것을 추천합니다. `Context`는 `Interface`의 개념이라면, `Provider`는 구현체이기 때문입니다. 그렇다고 `Context`에 구현이 안 들어가는 건 아닙니다. 왜냐하면 `initialState`와 `reducer`를 준비해야하기 때문이죠.

### `AgreementsContext.tsx`

```tsx
import {
  ChangeEvent,
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
} from "react";

type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

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
  agreements: {
    [K in TermValue]: boolean;
  };
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
```

하나씩 살펴봅시다.

```tsx
type RequiredTerms = "isMoreThan14" | "termOfService" | "privacy";

type OptionalTerms = "privacyThirdParty" | "marketing";

export type TermValue = RequiredTerms | OptionalTerms;
```

먼저 위의 타입은 `AgreementsState` 타입의 키로 들어갑니다.

```tsx
export type AgreementsState = {
  [K in TermValue]: boolean;
};
```

`useReducer`를 사용할 것이기 때문에 `State` 타입을 지정합니다.

```tsx
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

```

그리고 `ActionType`를 정의합니다.

```tsx
export const initialAgreements: AgreementsState = {
  isMoreThan14: false,
  privacy: false,
  termOfService: false,
  privacyThirdParty: false,
  marketing: false,
};
```

`reducer`에 들어가는 초기값 입니다.

```tsx
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
```

`reducer`를 정의했습니다. 프로퍼티에 직접 접근해서 수정한 것은 `useImmerReducer`를 사용할 것이기 때문입니다.

```tsx
export type AgreementsContextType = {
  /**
   * 동의 여부
   */
  agreements: {
    [K in TermValue]: boolean;
  };
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

```

`Context`의 하위 컴포넌트에서 사용할 것이기 때문에 주석을 사용해서 어떤 일을 하는 것인지 알려줍니다. 개발 경험 향상을 위한 것이죠.

```tsx
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

export default AgreementsContext
```

다음은 `Context`의 초기값입니다.

```tsx
export const useAgreementsContext = () => {
  const context = useContext(AgreementsContext);
  if (!context) {
    throw new Error(
      "This component must be used within a <Agreements> component."
    );
  }
  return context;
};
```

`Context`를 사용하기 위한 훅입니다. `Context`의 하위 컴포넌트에 있지 않으면 에러가 발생합니다.

### `Agreements.tsx`

```tsx
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
      const {
        name: targetName,
        required: targetRequired,
        checked: targetChecked,
      } = e.target;

      const isCheckedRequiredField = targetRequired && targetChecked;
      const isUncheckedRequiredField = targetRequired && !targetChecked;

      if (isCheckedRequiredField) {
        checkRequiredField(targetName as RequiredTerms);
      }

      if (isUncheckedRequiredField) {
        uncheckRequiredField(targetName as RequiredTerms);
      }

      const isAllAgreement = targetName === "allAgreements";

      const isCheckedAllAgreements = isAllAgreement && targetChecked;
      const isUnCheckedAllAgreements = isAllAgreement && !targetChecked;

      if (isCheckedAllAgreements) {
        checkAllAgreement();
      }

      if (isUnCheckedAllAgreements) {
        setRequiredField(cachedRequiredField.current);
      }

      dispatch({
        type: targetName as AgreementsAction["type"],
        payload: targetChecked,
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
```

굉장히 복잡해보이네요. 하나씩 뜯어봅시다.

```tsx
const cachedRequiredField = useRef<Set<TermValue>>(new Set<TermValue>());
```

먼저 초기에 `required` 값들을 캐싱을 위한 값입니다. 초기에 `input`을 렌더링하게 되는데, 마운트되는 시점에 `required` 값을`cachedRequiredField`에 넣습니다. 이 `cachedRequiredField`는 변하지 않습니다.

```tsx
const [requiredField, setRequiredField] = useState<Set<TermValue>>(
  new Set<TermValue>()
);
```

이것은 `required` 값을 추가하고 삭제할 수 있는 상태입니다. 요구사항은 다음과 같습니다.

- 마운트 시점 → `required` 필드이면 추가한다.
- 체크를 했을 경우 → `Set`에서 뺀다.
- 체크를 해제했을 경우 → `Set`에서 추가한다.

```tsx
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
```

이것은 마운트되는 시점에 `required` 값을 채우기 위한 함수입니다.

```tsx
const [state, dispatch] = useImmerReducer(
  agreementsReducer,
  initialAgreements
);
```

`useImmerReducer`로 `state`와 `dispatch`를 가져옵니다. “이걸 왜 사용하시나요?” 라고 물어보신다면, 관리하기 편해서 사용합니다. 한 번 살펴보세요.([https://immerjs.github.io/immer/example-setstate/](https://immerjs.github.io/immer/example-setstate/))

```tsx
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
    const {
      name: targetName,
      required: targetRequired,
      checked: targetChecked,
    } = e.target;

    const isCheckedRequiredField = targetRequired && targetChecked;
    const isUncheckedRequiredField = targetRequired && !targetChecked;

    if (isCheckedRequiredField) {
      checkRequiredField(targetName as RequiredTerms);
    }

    if (isUncheckedRequiredField) {
      uncheckRequiredField(targetName as RequiredTerms);
    }

    const isAllAgreement = targetName === "allAgreements";

    const isCheckedAllAgreements = isAllAgreement && targetChecked;
    const isUnCheckedAllAgreements = isAllAgreement && !targetChecked;

    if (isCheckedAllAgreements) {
      checkAllAgreement();
    }

    if (isUnCheckedAllAgreements) {
      setRequiredField(cachedRequiredField.current);
    }

    dispatch({
      type: targetName as AgreementsAction["type"],
      payload: targetChecked,
    });
  },
  [dispatch]
);
```

상당히 복잡해보이는데요, 한 번 하나씩 까봅시다.

```tsx
const checkRequiredField = (agreementName: RequiredTerms) => {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.delete(agreementName);
    return newSet;
  });
};
```

`required` 필드를 선택했을 때 `Set`에서 삭제하는 역할을 하는 함수 입니다.

```tsx
const uncheckRequiredField = (agreementName: RequiredTerms) => {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.add(agreementName);
    return newSet;
  });
};
```

`required` 필드를 선택 해제했을 때 `Set`에서 추가하는 역할을 하는 함수 입니다.

```tsx
const checkAllAgreement = () => {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.clear();
    return newSet;
  });
};
```

전체 선택을 했을 때, `Set`을 아예 비워주는 역할을 합니다.

```tsx
const isCheckedRequiredField = targetRequired && targetChecked;

if (isCheckedRequiredField) {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.delete(targetName as TermValue);
    return newSet;
  });
}
```

필수값이면서 체크된 값을 `Set`에서 삭제하는 역할을 합니다.

```tsx
const isUncheckedRequiredField = targetRequired && !targetChecked;

if (isUncheckedRequiredField) {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.add(targetName as TermValue);
    return newSet;
  });
}
```

필수값이면서 체크가 해제된 값을 `Set`에서 추가하는 역할을 합니다.

```tsx
const isCheckedAllAgreements =
  targetName === "allAgreements" && targetChecked;

if (isCheckedAllAgreements) {
  setRequiredField((prevRequiredField) => {
    const newSet = new Set(prevRequiredField);
    newSet.clear();
    return newSet;
  });
}
```

“전체 선택”을 체크했을 때, `Set`을 비워주는 역할을 합니다.

```tsx
const isUnCheckedAllAgreements =
  targetName === "allAgreements" && !targetChecked;

if (isUnCheckedAllAgreements) {
  setRequiredField(cachedRequiredField.current);
}
```

“전체 선택”을 해제했을 경우 기존에 캐시된 데이터를 추가합니다. 

```tsx
dispatch({
  type: targetName as AgreementsAction["type"],
  payload: targetChecked,
});
```

개별 선택을 했을 때, 값을 변경시키는 역할을 합니다.

여기까지가 `changeTermCheck` 입니다. 다른 로직도 계속해서 살펴봅시다.

```tsx
const isAllChecked = useCallback(() => {
  let key: TermValue;
  for (key in state) {
    if (!state[key]) {
      return false;
    }
  }
  return true;
}, [state]);
```

전부 체크이면 `true`, 하나라도 체크가 되어있지 않으면 `false` 입니다.

```tsx
const reset = useCallback(() => dispatch({ type: "reset" }), [dispatch]);
```

전부 체크를 해제하는 역할을 합니다.

```tsx
const isCheckedAllRequiredField = useMemo(
  () => requiredField.size === 0,
  [requiredField]
);
```

`requiredField`가 전부 체크가 되었는지 확인하는 역할입니다.

```tsx
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
```

이제 위에서 만든 `state`와 로직을 하위 컴포넌트에서 사용할 수 있도록 주입을 해줍니다.

### `AgreementCheckbox.tsx`

```tsx
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
```

하나씩 살펴봅시다.

```tsx
type AgreementCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "id"
> & {
  htmlFor: TermValue | "allAgreements";
  id: TermValue | "allAgreements";
  name: TermValue | "allAgreements";
};
```

`Omit`은 Object 타입에서 빼고 싶은 필드가 있을 때 사용합니다. 보통은 `Intersection` 하고 싶은데, 서로 다른 타입을 갖고 있을 때, 충돌을 방지하기 위해서 사용합니다. 저렇게 타입을 지정하면, `InputAttributes`를 기본적으로 받아온 다음, `name`, `id` 필드는 빼고, 제가 뒤에 선언한 타입이 합쳐지게 됩니다.

```tsx
useMountEffect(() => {
  initializeRequiredField(props.name as TermValue, props.required);
});
```

마운트될 때, `name`과 `required`를 불러와 `requiredField`와 `cachedRequiredField`에 채워줍니다.

```tsx
const checked = useMemo(() => {
  switch (props.name) {
    case "allAgreements":
      return isAllChecked();
    default:
      return agreements[props.name as TermValue];
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [agreements, isAllChecked]);
```

`checked`는 `input` 안에 `checked` 어트리뷰트에 들어갈 값입니다.

```tsx
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
```

`checked`와 `onChange` 함수를 연결해줍니다.

### `AgreementHelpMessage.tsx`

```tsx
import { useAgreementsContext } from "./AgreementsContext";

type AgreementHelpMessageProps = {
  message?: string;
};

export default function AgreementHelpMessage({
  message,
}: AgreementHelpMessageProps) {
  const { isCheckedAllRequiredField } = useAgreementsContext();

  return <>{isCheckedAllRequiredField ? null : <p>{message}</p>}</>;
}
```

`isCheckedAllRequiredField`로 `message`를 보여줍니다.

### `App.tsx`

```tsx
export default function App() {
  return (
    <Agreements>
      <AgreementCheckbox
        htmlFor="allAgreements"
        id="allAgreements"
        name="allAgreements"
      >
        전체 선택
      </AgreementCheckbox>
      <AgreementCheckbox
        htmlFor="isMoreThan14"
        id="isMoreThan14"
        name="isMoreThan14"
        required
      >
        14세 이상
      </AgreementCheckbox>
      <AgreementCheckbox
        htmlFor="termOfService"
        id="termOfService"
        name="termOfService"
        required
      >
        이용 약관 동의
      </AgreementCheckbox>
      <AgreementCheckbox
        htmlFor="privacy"
        id="privacy"
        name="privacy"
        required
      >
        개인정보 제공 동의
      </AgreementCheckbox>
      <AgreementCheckbox
        htmlFor="privacyThirdParty"
        id="privacyThirdParty"
        name="privacyThirdParty"
      >
        제 3자 개인정보 제공 동의
      </AgreementCheckbox>
      <AgreementCheckbox
        htmlFor="marketing"
        id="marketing"
        name="marketing"
      >
        마케팅
      </AgreementCheckbox>
      <AgreementHelpMessage message="필수값을 입력해주세요." />
    </Agreements>
  )
}
```

실제 사용하는 쪽을 보면 위와 같습니다. 여기서 주목할 점은 사용하는 쪽에는 State와 로직이 하나도 없다는 사실 입니다. 그것은 `Agreements` 컴포넌트 내부에서 State와 관련된 로직이 상호작용하고 있기 때문이죠. 인터페이스 혹은 로직이 변경된다면, `AgreementsContext`와 `Agreements` 파일을 변경해주면 됩니다.