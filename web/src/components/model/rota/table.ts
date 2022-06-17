import Excel from "exceljs";
import {Employee, Preferences, Roster, Task, Team} from "../domain";
import {Document} from "./document";
import {PrefsRecord, ShiftRecord} from "./record";
import {PrefsColumns, ShiftColumns} from "./columns";

export class ShiftTable {
  readonly records: ShiftRecord[] = [];
  priorTableCount = 0;

  private _employees: Employee[] | undefined;
  private _tasks: Task[] | undefined;

  constructor(readonly document: Document, readonly sheet: Excel.Worksheet) {
    const columns = new ShiftColumns();
    sheet.eachRow(row => {
      const teamName = row.getCell(columns.team).text;
      if (Team.exists(teamName)) {
        this.records.push(new ShiftRecord(document.themeColors, columns, row));
      }
    });
  }

  get employees(): Employee[] {
    if (this._employees === undefined) {
      const recentTables = this.document.tablesPreceding(this.sheet);
      this._employees = this.records
        .flatMap(record => {
          const preferences = this.document.preferences(record.name);
          if (preferences.areAllNo()) return [];
          const statistics = this.document.statistics(recentTables, record.name);
          return new Employee(record.name, record.team, record.statuses, preferences, statistics);
        })
      this.priorTableCount = recentTables.length;
    }
    return this._employees;
  }

  get tasks(): Task[] {
    if (this._tasks === undefined) {
      this._tasks = this.createTasks(this.employees);
      // this.addUnassignedTasksTo(this._tasks);
    }
    return this._tasks;
  }

  set tasks(value) {
    this._tasks = value;
    this._tasks.forEach(task => {
      if (task.employee !== null) {
        this.findRecord(task.employee.name)?.enterTask(task);
      }
    });
  }

  private createTasks(employees: Employee[]): Task[] {
    const tasks: Task[][] = [];
    for (const employee of employees) {
      const record = this.findRecord(employee.name);
      if (record !== undefined) {
        tasks.push(record.createTasks(employee));
      }
    }
    return tasks.flat();
  }

  applyRoster(roster: Roster) {
    this.tasks = roster.tasks;
  }

  getRecord(employee: Employee): ShiftRecord | undefined {
    return this.findRecord(employee.name);
  }

  findRecord(name: string): ShiftRecord | undefined {
    return this.records.find(record => record.name === name);
  }
}


export class PrefsTable {
  private records: PrefsRecord[] = [];

  constructor(sheet: Excel.Worksheet) {
    const columns = new PrefsColumns(sheet);
    sheet.eachRow(row => {
      const teamName = row.getCell(columns.team).text;
      if (Team.exists(teamName)) {
        this.records.push(new PrefsRecord(columns, row));
      }
    });
  }

  getPreferences(employeeName: string): Preferences {
    const record = this.records.find(record => record.name === employeeName);
    return record === undefined ? new Preferences() : record.getPreferences();
  }
}
