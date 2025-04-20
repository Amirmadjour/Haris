import { DataTable } from "./components/DataTable";
import Nav from "./components/Nav";

export default function Home() {
  return (
    <div className="bg-primary flex flex-col items-center justify-start w-screen h-screen">
      <Nav />
      <DataTable />
    </div>
  );
}