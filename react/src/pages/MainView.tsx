import { Home } from "./Home";
import { CreateCalendar } from "./CreateCalendar";
import { UpdateCalendar } from "./UpdateCalendar";
import type { MainViewProps } from "../types/pages";

export function MainView({
  mode,
  onRequestCreate,
  onRequestUpdate,
}: MainViewProps) {
  return (
    <main className="main-view">
      {mode === "create" ? (
        <CreateCalendar />
      ) : mode === "update" ? (
        <UpdateCalendar />
      ) : (
        <Home goCreate={onRequestCreate} goUpdate={onRequestUpdate} />
      )}
    </main>
  );
}
