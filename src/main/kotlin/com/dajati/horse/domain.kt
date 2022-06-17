package com.dajati.horse

import org.optaplanner.core.api.domain.entity.PlanningEntity
import org.optaplanner.core.api.domain.entity.PlanningPin
import org.optaplanner.core.api.domain.solution.PlanningEntityCollectionProperty
import org.optaplanner.core.api.domain.solution.PlanningScore
import org.optaplanner.core.api.domain.solution.PlanningSolution
import org.optaplanner.core.api.domain.valuerange.ValueRangeProvider
import org.optaplanner.core.api.domain.variable.PlanningVariable
import org.optaplanner.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore

@PlanningSolution
class Roster(
    @PlanningEntityCollectionProperty
    val tasks: List<Task>? = null,
    @ValueRangeProvider(id = "employeeRange")
    val employees: List<Employee>? = null,
) {
    @PlanningScore
    lateinit var score: HardMediumSoftScore
}

@PlanningEntity
class Task(
    val duty: Duty? = null,
    val shift: Shift? = null,
    @PlanningVariable(valueRangeProviderRefs = ["employeeRange"], nullable = true)
    val employee: Employee? = null,
) {
    val id = nextId++
    @PlanningPin
    val pinned = employee != null

    val dayOfWeek: Int
        get() = shift!!.ordinal / 2

    companion object {
        var nextId = 1
    }
}

data class Employee(
    val name: String,
    val team: Team,
    val statuses: Array<Status>,
    val preferences: Preferences,
    val statistics: Statistics,
) {
    val workingShiftCount = statuses.count {
        it == Status.AVAILABLE || it == Status.UNAVAILABLE  || it == Status.WORKING_FROM_HOME
    }
    val priorShiftCount = statistics.shiftCount
    val priorTaskCount = statistics.taskCounts.sum()

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Employee
        if (name != other.name) return false
        return true
    }

    override fun hashCode(): Int {
        return name.hashCode()
    }

    fun canPerform(task: Task): Boolean {
        val shift = task.shift!!
        val duty = task.duty!!
        return statuses[shift.ordinal] == Status.AVAILABLE && preferences[shift, duty]
    }
}

data class Preferences(val entries: List<List<Boolean>>) {
    operator fun get(shift: Shift, duty: Duty): Boolean {
        return entries[shift.ordinal][duty.ordinal]
    }
}

data class Statistics(val shiftCount: Int, val taskCounts: Array<Int>) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Statistics

        if (shiftCount != other.shiftCount) return false
        if (!taskCounts.contentEquals(other.taskCounts)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = shiftCount
        result = 31 * result + taskCounts.contentHashCode()
        return result
    }

}

enum class Team {
    PRINCIPALS,
    AML_MDS,
    MPN_CML,
    LYMPHOID,
}

enum class Duty {
    FISH,
    DS,
    LATE_DS,
    SS,
}

enum class Shift {
    MONDAY_AM,
    MONDAY_PM,
    TUESDAY_AM,
    TUESDAY_PM,
    WEDNESDAY_AM,
    WEDNESDAY_PM,
    THURSDAY_AM,
    THURSDAY_PM,
    FRIDAY_AM,
    FRIDAY_PM,
}

enum class Status {
    AVAILABLE,
    UNAVAILABLE,
    WORKING_FROM_HOME,
    ANNUAL_LEAVE,
    DOES_NOT_WORK,
}