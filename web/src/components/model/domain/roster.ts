import {Duty, Shift, Task} from "./task";
import {Employee, Team} from "./employee";
import {ShiftTable} from "../rota/table";
import Settings from "../settings";

/**
 * All the data constituting a problem for solution by Optaplanner.
 */

export class Roster {
  constructor(readonly employees: Employee[], readonly tasks: Task[]) {}

  static fromTable(settings: Settings, table: ShiftTable): Roster {
    const employees = table.employees;
    const tasks = table.tasks;
    settings.addUnassignedTasksTo(tasks);
    return new Roster(employees, tasks);
  }

  static fromJSON(text: string) {
    const body = JSON.parse(text, Roster.reviver);
    return new Roster(body.employees, body.tasks);
  }

  private static reviver(key: string, value: string) {
    switch (key) {
      case "team":
        return Team.enumValueOf(value);
      case "duty":
        return Duty.enumValueOf(value);
      case "shift":
        return Shift.enumValueOf(value);
      default:
        return value;
    }
  }
}
