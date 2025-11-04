import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import PredictionsTab from "./components/PredictionsTab";
import HistoryTab from "./components/HistoryTab";
import { SettingsPanel } from "./components/SettingsPanel";
import { AuthForm } from "./components/AuthForm";
import { ThemeProvider } from "./ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <PredictionsTab
                  predictions={[]}
                  loading={false}
                  onFetchPredictions={() => {}}
                  onRecordResult={() => {}}
                />
              }
            />
            <Route
              path="/history"
              element={
                <HistoryTab
                  historicalData={[]}
                  onClearHistory={() => {}}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPanel
                  userId={""}
                  onClose={() => {}}
                />
              }
            />
            <Route path="/auth" element={<AuthForm loading={false} error="" />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
