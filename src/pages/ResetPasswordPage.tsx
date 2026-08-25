import ResetPasswordForm from "../components/ResetPasswordForm";

type ResetPasswordPageProps = {
  apiUrl: string;
  resetToken: string;
  onSuccess: () => void;
};

function ResetPasswordPage({
  apiUrl,
  resetToken,
  onSuccess,
}: ResetPasswordPageProps) {
  return (
    <ResetPasswordForm
      apiUrl={apiUrl}
      resetToken={resetToken}
      onSuccess={onSuccess}
    />
  );
}

export default ResetPasswordPage;