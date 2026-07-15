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
    // Used only via the dynamic JsonElement API (no @Serializable classes, so no
    // compiler plugin) to parse/emit the shared `cubeState` wire format. Pure
    // JVM/multiplatform — keeps this module Android-free.
    implementation(libs.kotlinx.serialization.json)
    testImplementation(libs.junit)
}

// Forward the verification harness's knobs into the test JVM, e.g.
// `./gradlew :core:test -DVERIFY_N=20000` (scale) / `-DVERIFY_SEED=123` (fuzz).
// Do NOT add maxParallelForks or a parallel JUnit runner here: the engine is a
// process-wide singleton and the harness relies on sequential execution.
tasks.test {
    listOf("VERIFY_N", "VERIFY_SEED").forEach { key ->
        providers.systemProperty(key).orNull?.let { systemProperty(key, it) }
    }
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
