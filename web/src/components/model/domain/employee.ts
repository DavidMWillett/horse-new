import {Enumify} from "enumify";
import Color from "color";
import {Duty, Shift} from "./task";


export class Employee {
  constructor(readonly name: string,
              private readonly team: Team,
              private readonly statuses: Status[],
              readonly preferences: Preferences,
              readonly statistics: Statistics) {}

  canDoTasks(): boolean {
    return this.preferences !== undefined && !this.preferences.areAllNo();
  }

  get taskLoad(): number {
    return this.statistics.usage;
  }
}


export class Statistics {
  shiftCount = 0;
  taskCounts = Array(Duty.enumValues.length).fill(0);

  get usage(): number {
    return this.taskCounts.reduce((acc, val) => acc + val, 0) / this.shiftCount;
  }

  addAssign(other: Statistics) {
    this.shiftCount += other.shiftCount;
    for (let i = 0; i < Duty.enumValues.length; i++) {
      this.taskCounts[i] += other.taskCounts[i];
    }
  }
}


export class Team extends Enumify {
  constructor(readonly title: string) {
    super();
  }

  static PRINCIPALS = new Team("Principals");
  static AML_MDS = new Team("AML/MDS");
  static MPN_CML = new Team("MPN/CML");
  static LYMPHOID = new Team("Lymphoid");
  static _ = Team.closeEnum();

  static exists(title: string): boolean {
    return Team.fromTitle(title) !== undefined
  }

  static fromTitle(title: string): Team | undefined {
    // @ts-ignore
    const teams: Team[] = [...Team];
    return teams.find(team => team.title === title);
  }

  toJSON() {
    return this.enumKey;
  }
}


export class Preferences {
  private readonly entries: boolean[][];

  constructor() {
    this.entries = Array(Shift.enumValues.length);
    // @ts-ignore
    for (const shift of Shift) {
      this.entries[shift.enumOrdinal] = Array(Duty.enumValues.length);
      // @ts-ignore
      for (const duty of Duty) {
        this.entries[shift.enumOrdinal][duty.enumOrdinal] = false;
      }
    }
  }

  set(shift: Shift, duty: Duty, value: boolean) {
    this.entries[shift.enumOrdinal][duty.enumOrdinal] = value;
  }

  areAllNo(): boolean {
    return this.entries.flat().every(value => value === false);
  }
}


export class Status extends Enumify {
  constructor(readonly color: Color | null) {
    super();
  }

  static AVAILABLE = new Status(Color("#FFFFFF"));
  static UNAVAILABLE = new Status(null);
  static WORKING_FROM_HOME = new Status(Color("#92D050"));
  static ANNUAL_LEAVE = new Status(Color("#BFBFBF"));
  static DOES_NOT_WORK = new Status(Color("#000000"));
  static _ = Status.closeEnum();

  toJSON() {
    return this.enumKey;
  }

  static fromColor(color: Color): Status | null {
    // @ts-ignore
    const statuses: Status[] = [...Status];
    return statuses.find(status => status.color?.rgbNumber() === color.rgbNumber()) ?? null;
  }
}
