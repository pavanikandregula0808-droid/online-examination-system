import { CameraPreview } from "./features/face/components/CameraPreview";

function App() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "24px",
        backgroundColor: "#f4f7fc",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        <CameraPreview />
      </div>
    </main>
  );
}

export default App;