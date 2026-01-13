import { BRAND_NAME } from "../branding";

export default function Head() {
  return (
    <>
      <title>Login — {BRAND_NAME}</title>
      <meta name="description" content="Sign in to manage bots, billing, and files securely." />
    </>
  );
}
