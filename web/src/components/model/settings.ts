import {ShiftTable} from "./rota/table";
import {Duty, Shift, Task} from "./domain/task";

class Settings {

  readonly tasksPerShift = new Map<Duty, Array<number>>([
    [Duty.FISH, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
    [Duty.DS, [1, 0, 1, 0, 1, 1, 1, 1, 1, 1]],
    [Duty.LATE_DS, [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]],
    [Duty.SS, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  ]);

  incrementTasks(duty: Duty, shift: Shift) {
    const row = this.tasksPerShift.get(duty as Duty)!
    row[shift.enumOrdinal] = (row[shift.enumOrdinal] + 1) % 3;
  }

  getUnassignedTaskCount(table: ShiftTable): number {
    const taskCounts = Duty.enumValues.map(() => new Array(Shift.enumValues.length).fill(0));
    for (const task of table.tasks) {
      taskCounts[task.duty.enumOrdinal][task.shift.enumOrdinal]++;
    }
    let unassignedTaskCount = 0;
    for (const duty of Duty.enumValues) {
      for (const shift of Shift.enumValues) {
        unassignedTaskCount += Math.max(0,
          this.tasksPerShift.get(duty as Duty)![shift.enumOrdinal] -
          taskCounts[duty.enumOrdinal][shift.enumOrdinal]);
      }
    }
    return unassignedTaskCount;
  }

  addUnassignedTasksTo(tasks: Task[]) {
    // @ts-ignore
    for (const duty of Duty) {
      // @ts-ignore
      for (const shift of Shift) {
        const tasksRequired = this.tasksPerShift.get(duty)![shift.enumOrdinal];
        const tasksPresent = tasks.filter(task => task.duty === duty && task.shift === shift).length;
        for (let i = 0; i < tasksRequired - tasksPresent; i++) {
          tasks.push(new Task(duty, shift));
        }
      }
    }
  }
}

export default Settings;
