// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
    // Declared here at a known version so the pure-Kotlin :core module can apply it
    // without a plugin-classpath version clash (the Kotlin plugin is already on the
    // build classpath transitively via the Compose plugin).
    alias(libs.plugins.kotlin.jvm) apply false
}