import Header from "@/components/Header";
import Gallery from "@/components/Gallery";
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  return (
    <PasswordGate>
      <main className="min-h-screen pb-4">
        <Header />
        <Gallery />
      </main>
    </PasswordGate>
  );
}
