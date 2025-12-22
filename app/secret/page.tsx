import SecretClient, { secretMetadata } from "./SecretClient";

export const metadata = secretMetadata;

export default function SecretPage() {
  return <SecretClient />;
}