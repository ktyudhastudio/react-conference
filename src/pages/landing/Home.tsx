import useDocumentTitle from "@hooks/useDocumentTitle";
import JoinHero from "@modules/landing/JoinHero";

export default function Home() {
  useDocumentTitle();
  return <JoinHero />;
}
