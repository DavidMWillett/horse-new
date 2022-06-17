import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import com.moowork.gradle.node.npm.NpmTask

plugins {
	id("org.springframework.boot") version "2.7.0"
	id("io.spring.dependency-management") version "1.0.11.RELEASE"
	id("com.github.node-gradle.node") version "2.2.0"
	kotlin("jvm") version "1.6.21"
	kotlin("plugin.spring") version "1.6.21"
}

group = "com.dajati"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	implementation("org.optaplanner:optaplanner-spring-boot-starter:8.4.1.Final")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "11"
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}

val installDependencies by tasks.registering(NpmTask::class) {
	setArgs(listOf("install"))
	setExecOverrides(closureOf<ExecSpec> {
		setWorkingDir("./web")
	})
}

val buildWeb by tasks.registering(NpmTask::class) {
	dependsOn(installDependencies)
	setArgs(listOf("run", "build:gradle"))
	setExecOverrides(closureOf<ExecSpec> {
		setWorkingDir("./web")
	})
}

tasks.build {
	dependsOn(buildWeb)
}
