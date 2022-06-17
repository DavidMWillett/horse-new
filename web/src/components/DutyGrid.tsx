import {Table} from "react-bootstrap";
import {Duty, Shift} from "./model/domain/task";
import Settings from "./model/settings";
import DutyGridCell from "./DutyGridCell";
import "./DutyGrid.css";

function DutyGrid({settings, onChange}: {
  settings: Settings,
  onChange: (settings: Settings) => void,
}) {
  const newSettings = settings;
  return (
    <Table bordered size="sm">
      <thead>
        <tr>
          <th rowSpan={2}></th>
          <th colSpan={2}>Mon</th>
          <th colSpan={2}>Tue</th>
          <th colSpan={2}>Wed</th>
          <th colSpan={2}>Thu</th>
          <th colSpan={2}>Fri</th>
        </tr>
        <tr>
          {
            Shift.enumValues.map(value => <th className="times">{value.enumOrdinal % 2 === 0 ? "AM" : "PM"}</th>)
          }
        </tr>
      </thead>
      <tbody>
        {
          Array.from(newSettings.tasksPerShift, ([duty, taskCounts]) =>
            <tr>
              <td className="label">{duty.description}</td>
              {
                taskCounts.map((taskCount, index) =>
                  <DutyGridCell
                    row={duty.enumOrdinal}
                    col={index}
                    value={taskCount}
                    onClick={(row, col) => {
                      newSettings.incrementTasks(Duty.enumValues[row] as Duty, Shift.enumValues[col] as Shift);
                      onChange(newSettings);
                    }}
                  />
                )
              }
            </tr>
          )
        }
      </tbody>
    </Table>
  );
}

export default DutyGrid;