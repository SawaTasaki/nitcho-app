import { Home } from "./Home";
import { CreateCalendar } from "./CreateCalendar";
import { UpdateCalendar } from "./UpdateCalendar";

export type MainViewMode = "create" | "update";

type MainViewProps = {
  mode: MainViewMode | null;
  onRequestCreate: () => void;
  onRequestUpdate: () => void;
};

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
