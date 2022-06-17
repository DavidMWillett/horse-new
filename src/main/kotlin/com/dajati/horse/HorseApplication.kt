package com.dajati.horse

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class HorseApplication

fun main(args: Array<String>) {
    runApplication<HorseApplication>(*args)
}
