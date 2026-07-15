// The control panel — analog of ../src/presentations/3DWeb/panel.ts + the button rows
// from 3DWeb.html: stats readout, status pill, drivers (Scramble/Solve/Abort/Reset),
// manual face turns, and whole-cube re-orientations. Pure renders of UiState; every
// intent is a ViewModel call.
package com.mikeb.simplepuzzlecube.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

@Composable
fun StatusRow(state: UiState, modifier: Modifier = Modifier) {
    val meta = STATUS_META.getValue(state.status)
    val color = meta.color ?: MaterialTheme.colorScheme.onSurface
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(color))
            Text(meta.label, color = color, modifier = Modifier.padding(start = 8.dp))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("⏱ ${timeText(state.elapsedMs)}")
            Text("↻ ${state.moveCount}")
        }
    }
}

@Composable
fun DriverControls(
    state: UiState,
    onScramble: () -> Unit,
    onSolve: () -> Unit,
    onAbort: () -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier
) {
    // While the solver is active, every control is locked except Abort; Abort is live only
    // during a solve and shows "Aborting…" while the abort unwinds (which isn't instant).
    val locked = state.solverActive
    val slim = androidx.compose.foundation.layout.PaddingValues(horizontal = 4.dp, vertical = 8.dp)
    Row(modifier = modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = onScramble, enabled = !locked, modifier = Modifier.weight(1f), contentPadding = slim) {
            Text("Scramble", maxLines = 1)
        }
        if (state.solverActive) {
            Button(onClick = onAbort, enabled = !state.aborting, modifier = Modifier.weight(1f), contentPadding = slim) {
                Text(if (state.aborting) "Aborting…" else "Abort", maxLines = 1)
            }
        } else {
            Button(onClick = onSolve, modifier = Modifier.weight(1f), contentPadding = slim) {
                Text("Solve", maxLines = 1)
            }
        }
        OutlinedButton(onClick = onReset, enabled = !locked, modifier = Modifier.weight(1f), contentPadding = slim) {
            Text("Reset", maxLines = 1)
        }
    }
}

@Composable
fun ManualControls(
    state: UiState,
    prime: Boolean,
    onPrimeChange: (Boolean) -> Unit,
    onFaceMove: (MoveKey) -> Unit,
    onCubeMove: (CubeMoveKey) -> Unit,
    modifier: Modifier = Modifier
) {
    val locked = state.solverActive
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            listOf(MoveKey.U, MoveKey.D, MoveKey.L, MoveKey.R, MoveKey.F, MoveKey.B).forEach { key ->
                OutlinedButton(
                    onClick = { onFaceMove(key) },
                    enabled = !locked,
                    modifier = Modifier.weight(1f),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
                ) {
                    Text(key.name + if (prime) "′" else "")
                }
            }
            FilterChip(selected = prime, onClick = { onPrimeChange(!prime) }, label = { Text("′") })
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf(
                "⟲ Spin" to CubeMoveKey.spinLeft,
                "⟳ Spin" to CubeMoveKey.spinRight,
                "↑ Roll" to CubeMoveKey.rollUp,
                "↓ Roll" to CubeMoveKey.rollDown
            ).forEach { (label, key) ->
                OutlinedButton(
                    onClick = { onCubeMove(key) },
                    enabled = !locked,
                    modifier = Modifier.weight(1f),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
                ) {
                    Text(label)
                }
            }
        }
    }
}
