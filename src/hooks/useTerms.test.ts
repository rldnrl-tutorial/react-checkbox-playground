import { renderHook, act } from "@testing-library/react";
import useTerms from "./useTerms";

describe("useTerms Test", () => {
  it("should onTermChange test", () => {
    const { result } = renderHook(() => useTerms());

    act(() => result.current.onTermChange("privacy", true));
    act(() => result.current.onTermChange("privacyThirdParty", true));

    expect(result.current.agreements).toStrictEqual([
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
        checked: true,
        required: true,
      },
      {
        value: "privacyThirdParty",
        checked: true,
        required: false,
      },
      {
        value: "marketing",
        checked: false,
        required: false,
      },
    ]);
  });

  it("should all agrees", () => {
    const { result } = renderHook(() => useTerms());

    act(() => result.current.onTermChange("allAgreements", true));

    expect(result.current.agreements).toStrictEqual([
      {
        value: "isMoreThan14",
        checked: true,
        required: true,
      },
      {
        value: "termOfService",
        checked: true,
        required: true,
      },
      {
        value: "privacy",
        checked: true,
        required: true,
      },
      {
        value: "privacyThirdParty",
        checked: true,
        required: false,
      },
      {
        value: "marketing",
        checked: true,
        required: false,
      },
    ]);
  });
});
