import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// The pure-Kotlin/JVM heart of the app: the cube engine, the solver, the shared
// interfaces, and utils — a near-verbatim port of the TypeScript `src/` core.
//
// This module intentionally applies ONLY the Kotlin/JVM plugin and depends on NO
// Android APIs. That is the compiler-enforced version of the project's central
// invariant ("dependencies point inward; the engine depends on nothing"): if any
// engine or solver code ever reaches for an Android type, this module won't compile.
// The verification harness therefore runs as fast, headless JVM tests (`:core:test`).
plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    // The solver is async/paced (suspend fns + a pacer); coroutines are its backbone.
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.junit)
}

// Match the app's Java 11 bytecode target (Android consumes it happily). Compiling
// with the Gradle daemon's JDK (21) means no extra toolchain download.
kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_11
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}
