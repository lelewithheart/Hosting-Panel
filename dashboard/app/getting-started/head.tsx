import { BRAND_NAME } from "../branding";

export default function Head() {
  return (
    <>
      <title>Getting Started — {BRAND_NAME}</title>
      <meta name="description" content="Deploy Node or Python bots in minutes using Docker templates or auto-detected builds, then start and monitor." />
    </>
  );
}
