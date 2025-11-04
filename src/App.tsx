import React from "react";
import { Header } from "./components/Header";
import { AuthForm } from "./components/AuthForm";
import { PredictionsTab } from "./components/PredictionsTab";
import { HistoryTab } from "./components/HistoryTab";
import { SettingsPanel } from "./components/SettingsPanel";

export default function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <Header
        onSettingsClick={() => {
          // handle settings click
        }}
        onSignOut={() => {
          // handle sign out
        }}
      />
      
      <h2>✅ App Running</h2>
      <p>We are loading existing components one by one to verify they work.</p>

      {/* Enable components gradually */}
      <div style={{ marginTop: "20px" }}>
        <AuthForm loading={false} error="" />
        <PredictionsTab
          predictions={[]}
          loading={false}
          onFetchPredictions={() => {}}
          onRecordResult={() => {}}
        />
        {/* <HistoryTab /> */}
        <SettingsPanel userId="demoUser" onClose={() => {}} />
      </div>
    </div>
  );
}
