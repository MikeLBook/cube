// The screen: renderer (3D cube or 2D net) + panel, plus the presentation half of the
// pacing handshake. Both renderers hang off the same ViewModel — swapping them is the
// point of the architecture (the engine/solver/pacer stack doesn't know which one runs).
package com.mikeb.simplepuzzlecube.ui.view

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mikeb.simplepuzzlecube.ui.view.cube3d.Cube3DView
import com.mikeb.simplepuzzlecube.ui.viewmodel.CubeViewModel
import kotlinx.coroutines.delay

// How long the net view "presents" one move before acknowledging it — its stand-in for
// the 3D view's turn animation. The pacer contract is identical either way: the driver's
// next move waits for the acknowledgment.
private const val PRESENT_MS = 120L
private const val PRESENT_FAST_MS = 45L

private enum class ViewMode { Cube3D, Net }

@Composable
fun CubeScreen(modifier: Modifier = Modifier, viewModel: CubeViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsState()
    var prime by remember { mutableStateOf(false) }
    var mode by rememberSaveable { mutableStateOf(ViewMode.Cube3D) }

    // The net has no turn animation, so in Net mode the screen acknowledges each pending
    // move after a fixed presentation window. In 3D mode Cube3DView acknowledges on
    // animation end instead (moveSettled is id-guarded, so a stale acknowledgment is inert).
    val pending = state.pendingMove
    if (mode == ViewMode.Net) {
        LaunchedEffect(pending?.id) {
            if (pending != null) {
                delay(if (pending.fast) PRESENT_FAST_MS else PRESENT_MS)
                viewModel.moveSettled(pending.id)
            }
        }
    }

    Column(
        modifier = modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        StatusRow(state)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            FilterChip(
                selected = mode == ViewMode.Cube3D,
                onClick = { mode = ViewMode.Cube3D },
                label = { Text("3D") }
            )
            FilterChip(
                selected = mode == ViewMode.Net,
                onClick = { mode = ViewMode.Net },
                label = { Text("Net") }
            )
        }
        when (mode) {
            ViewMode.Cube3D -> Cube3DView(
                state = state,
                onUserMove = { face, isPrime -> viewModel.userMove(face, isPrime) },
                onMoveSettled = viewModel::moveSettled,
                modifier = Modifier.fillMaxWidth().aspectRatio(1.15f)
            )
            ViewMode.Net -> NetView(state.cubies, modifier = Modifier.fillMaxWidth())
        }
        DriverControls(
            state = state,
            onScramble = viewModel::scramble,
            onSolve = viewModel::startSolve,
            onAbort = viewModel::abortSolve,
            onReset = viewModel::reset
        )
        ManualControls(
            state = state,
            prime = prime,
            onPrimeChange = { prime = it },
            onFaceMove = { key -> viewModel.userMove(key, prime) },
            onCubeMove = viewModel::userCubeMove
        )
    }
}
