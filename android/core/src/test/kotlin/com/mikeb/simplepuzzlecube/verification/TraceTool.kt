// Debug entry point mirroring the TS harness's run.mjs modes — run from the IDE
// (right-click → Run 'TraceToolKt') or via a JavaExec on the test runtime classpath.
//
//   count [N] | realcount [N] | statecount [N] | solve '<json>' | repro <outcome> | trace '<json-move-array>'
//
// Move arrays use the same JSON shape as the TS tools (["rotateTopCW","XCW",...]), so a
// failing scramble can be replayed against BOTH implementations for cross-debugging.
package com.mikeb.simplepuzzlecube.verification

import com.mikeb.simplepuzzlecube.engine.LayerMove
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.Rotation
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlin.random.Random

private fun parseMoves(json: String): List<Move> =
    (Json.parseToJsonElement(json) as JsonArray).map { element ->
        val name = (element as JsonPrimitive).content
        LayerMove.entries.find { it.name == name }
            ?: Rotation.entries.find { it.name == name }
            ?: throw IllegalArgumentException("unknown move: $name")
    }

fun main(args: Array<String>) = runBlocking {
    val mode = args.getOrNull(0) ?: "count"
    val rng = Random(System.getProperty("VERIFY_SEED")?.toLong() ?: 424242L)
    fun n(default: Int) = args.getOrNull(1)?.toIntOrNull() ?: default

    fun report(label: String, result: Harness.TallyResult, total: Int) {
        println(result.tally.entries.joinToString("\n") { "  ${it.key}: ${it.value}" })
        if ((result.tally[Harness.OK] ?: 0) == total) {
            println("\n✅ $label: all $total scrambles solved")
        } else {
            println("\n❌ $label: ${total - (result.tally[Harness.OK] ?: 0)} / $total did not solve")
            result.firstFailure?.let { println("first failure: ${Harness.toJson(it)}") }
        }
    }

    when (mode) {
        "count" -> n(5000).let { report("count", Harness.count(it, rng), it) }
        "realcount" -> n(5000).let { report("realcount", Harness.realCount(it, rng), it) }
        "statecount" -> n(5000).let { report("statecount", Harness.stateCount(it, rng), it) }
        "solve" -> Harness.solve(parseMoves(args[1]))
        "repro" -> Harness.repro(args.getOrNull(1) ?: "edges-stuck", rng)
        "trace" -> Harness.trace(parseMoves(args[1]))
        else -> println(
            "modes: count [N] | realcount [N] | statecount [N] | solve '<json>' | repro <outcome> | trace '<json-move-array>'"
        )
    }
}
