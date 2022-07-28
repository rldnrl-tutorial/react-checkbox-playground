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
