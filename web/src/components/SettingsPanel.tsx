import React from "react";
import Settings from "./model/settings";
import Form from "react-bootstrap/Form";
import DutyGrid from "./DutyGrid";

function SettingsPanel({settings, onChange}: {
  settings: Settings,
  onChange: (settings: Settings) => void,
}) {
  return (
    <Form.Group>
      <Form.Label>Number of duties to be assigned:</Form.Label>
      <DutyGrid
        settings={settings}
        onChange={onChange}
      />
      <p>This is where you tell HORSE how many of each type of duty you want to assign for each session. If the
        default settings are not correct, click the buttons in the grid above to set the number of duties to assign.
        Each button cycles through 0, 1 or 2 duties for each session.</p>
    </Form.Group>
  );
}

export default SettingsPanel;
