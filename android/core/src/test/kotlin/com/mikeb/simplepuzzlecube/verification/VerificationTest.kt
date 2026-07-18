package com.mikeb.simplepuzzlecube.verification

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test
import kotlin.random.Random

// The verification gate — the Kotlin analog of `npm run verify` (see Harness.kt).
// Every scramble must solve; the 100% bar is absolute (the TS record is 20000/20000),
// so ANY non-"ok" outcome is a port bug to trace, not noise.
//
// Deterministic by default; override with -DVERIFY_SEED=<long> to fuzz new scrambles
// and -DVERIFY_N=<int> to scale (e.g. a one-off N=20000 run to match the TS record).
// On failure the message includes the seed and the first failing scramble as a JSON
// move array pasteable into TraceTool or the TS `node run.mjs trace '<json>'`.
class VerificationTest {
    private val n = System.getProperty("VERIFY_N")?.toInt() ?: 2000
    private val stateN = System.getProperty("VERIFY_N")?.toInt()?.div(2) ?: 1000
    private val seed = System.getProperty("VERIFY_SEED")?.toLong() ?: 424242L

    private fun assertAllOk(label: String, result: Harness.TallyResult, expected: Int) {
        assertEquals(
            "$label (seed=$seed): tally=${result.tally}" +
                (result.firstFailure?.let { "\nfirst failing scramble: ${Harness.toJson(it)}" } ?: ""),
            expected,
            result.tally[Harness.OK] ?: 0
        )
    }

    // The hand-rolled phase loop with independent per-phase ground truths — surfaces
    // stuck phases, lying completion checks, and runaways as distinct outcomes.
    @Test
    fun `count - phase loop solves all scrambles`() = runBlocking {
        assertAllOk("count", Harness.count(n, Random(seed)), n)
    }

    // The authoritative production-path measure: the real solver.run().
    @Test
    fun `realcount - solver run() solves all scrambles`() = runBlocking {
        assertAllOk("realcount", Harness.realCount(n, Random(seed + 1)), n)
    }

    // The setState load path (serialize → reset → setState → run) — the dedicated
    // regression guard for cubeMap staleness after setState.
    @Test
    fun `statecount - setState-loaded scrambles all solve`() = runBlocking {
        assertAllOk("statecount", Harness.stateCount(stateN, Random(seed + 2)), stateN)
    }
}
