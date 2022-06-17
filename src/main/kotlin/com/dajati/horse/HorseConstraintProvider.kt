package com.dajati.horse

import org.optaplanner.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore
import org.optaplanner.core.api.score.stream.*

class HorseConstraintProvider : ConstraintProvider {
    override fun defineConstraints(constraintFactory: ConstraintFactory): Array<Constraint> {
        return arrayOf(
            simultaneousTasks(constraintFactory),
            employeeNotAvailable(constraintFactory),
            assignAllTasks(constraintFactory),
            maxOneTaskPerDay(constraintFactory),
            fullDayFISH(constraintFactory),
            maxThreeTasksPerWeek(constraintFactory),
            maxOneDSTaskPerWeek(constraintFactory),
            excludePrincipals(constraintFactory),
            shareTasksFairly(constraintFactory),
        )
    }

    private fun simultaneousTasks(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee != null }
            .join(
                Task::class.java,
                Joiners.equal(Task::shift),
                Joiners.equal(Task::employee),
                Joiners.lessThan(Task::id)
            )
            .penalize("Employee assigned to multiple simultaneous tasks", HardMediumSoftScore.ONE_HARD)
    }

    private fun employeeNotAvailable(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee != null && !task.employee.canPerform(task) }
            .penalize("Employee not available for shift/duty", HardMediumSoftScore.ONE_HARD)
    }

    private fun assignAllTasks(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee == null }
            .penalize("Unassigned task", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun maxOneTaskPerDay(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .join(
                Task::class.java,
                Joiners.lessThan(Task::id),
                Joiners.equal(Task::employee),
                Joiners.filtering { t1, t2 -> t1.duty != Duty.FISH || t2.duty != Duty.FISH })
            .filter { t1, t2 -> t1.dayOfWeek == t2.dayOfWeek }
            .penalize("Two tasks on same day (unless both FISH)", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun fullDayFISH(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .join(
                Task::class.java,
                Joiners.lessThan(Task::id),
                Joiners.equal(Task::employee),
                Joiners.filtering { t1, t2 -> t1.duty == Duty.FISH && t2.duty == Duty.FISH })
            .filter { t1, t2 -> t1.dayOfWeek == t2.dayOfWeek }
            .reward("FISH tasks on same day", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun maxThreeTasksPerWeek(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee !== null }
            .groupBy(Task::employee, ConstraintCollectors.count())
            .filter { _, count -> count > 3 }
            .penalize("Employee with more than three tasks", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun maxOneDSTaskPerWeek(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .join(Task::class.java,
                Joiners.lessThan(Task::id),
                Joiners.equal(Task::employee),
                Joiners.filtering { t1, t2 ->
                    (t1.duty == Duty.DS || t1.duty == Duty.LATE_DS) &&
                            (t2.duty == Duty.DS || t2.duty == Duty.LATE_DS)
                }
            )
            .penalize("Employee with more than one (Late)DS task", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun excludePrincipals(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee != null && task.employee.team == Team.PRINCIPALS }
            .penalize("Use of principals", HardMediumSoftScore.ONE_MEDIUM)
    }

    private fun shareTasksFairly(constraintFactory: ConstraintFactory): Constraint {
        return constraintFactory.from(Task::class.java)
            .filter { task -> task.employee !== null }
            .groupBy(Task::employee, ConstraintCollectors.count())
            .filter { employee, _ -> employee!!.workingShiftCount > 0 && employee.priorShiftCount > 0 }
            .penalize(
                "Tasks shared unfairly between employees",
                HardMediumSoftScore.ONE_SOFT
            ) { employee, taskCount ->
                // We need both an additive and a multiplicative component to determine penalty correctly
                val penalty = ((50 + 100 * employee!!.priorTaskCount / employee.priorShiftCount)
                        * taskCount / employee.workingShiftCount)
                penalty * penalty
            }
    }
}
