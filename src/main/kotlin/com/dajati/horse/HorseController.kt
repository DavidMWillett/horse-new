package com.dajati.horse

import org.optaplanner.core.api.solver.SolverManager
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.*
import java.util.concurrent.ExecutionException

@CrossOrigin
@RestController
class HorseController(val solverManager: SolverManager<Roster, UUID>) {
    @PostMapping("/solve")
    fun solve(@RequestBody problem: Roster): Roster {
        val problemId = UUID.randomUUID()
        val solverJob = solverManager.solve(problemId, problem)
        return try {
            solverJob.finalBestSolution
        } catch (e: Exception) {
            when (e) {
                is InterruptedException,
                is ExecutionException -> {
                    throw IllegalStateException("Solving failed.", e)
                }
                else -> throw e
            }
        }
    }
}
