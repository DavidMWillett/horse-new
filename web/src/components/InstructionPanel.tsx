import React from "react";
import "./InstructionPanel.css";

function InstructionPanel(props: { hasFinished: boolean }) {
  return (
    <React.Fragment>
      <h2>Instructions</h2>
      {!props.hasFinished ? (
        <ul className="horseshoe">
          <li>
            Start by checking under the "Settings" tab that the numbers of each duty to assign are set correctly. If
            not, click the buttons in the grid to change the numbers of duties to be assigned.
          </li>
          <li>
            When you are happy with the settings, select the "Run" tab. Click the "Choose file" button, and a
            file selection window will open.
          </li>
          <li>
            Browse to the folder containing the shift rota file and select that file. Click
            "Open". The file selection window will close, and you will see the name of the selected file next to the
            "Choose file" button.
          </li>
          <li>
            Now click the "Select rota sheet" input field, and select the sheet to be planned.
          </li>
          <li>
            Click the "Plan rota sheet" button, and wait for about 5 seconds while HORSE plans the rota for the sheet
            you chose.
          </li>
        </ul>
      ) : (
        <ul className="horseshoe">
          <li>
            The "Rota" tab shows a preview of the duties that HORSE has assigned. Click the "Save rota file" button
            to save the file containing the completed rota.
          </li>
          <li>
            When the "Save As" window opens, click "Save". The rota file will then be saved under the same name as the
            input file, but with a "(1)" suffix.
          </li>
          <li>
            Finally, open the saved file and check that the rota has been planned as desired. If all is well, save the
            new file so that it overwrites the original file, and then delete the file with the "(1)" suffix.
          </li>
        </ul>
      )}
    </React.Fragment>
  );
}

export default InstructionPanel;
