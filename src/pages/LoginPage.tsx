import AuthForm from "../components/AuthForm";

type LoginPageProps = {
  apiUrl: string;
  onLogin: (accessToken: string) => void;
};

function LoginPage({
  apiUrl,
  onLogin,
}: LoginPageProps) {
  return (
    <AuthForm
      apiUrl={apiUrl}
      onLogin={onLogin}
    />
  );
}

export default LoginPage;