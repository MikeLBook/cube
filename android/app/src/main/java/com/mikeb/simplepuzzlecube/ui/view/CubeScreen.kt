// The screen: renderer (3D cube or 2D net) + panel, plus the presentation half of the
// pacing handshake. Both renderers hang off the same ViewModel — swapping them is the
// point of the architecture (the engine/solver/pacer stack doesn't know which one runs).
package com.mikeb.simplepuzzlecube.ui.view

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mikeb.simplepuzzlecube.ui.view.cube3d.Cube3DView
import com.mikeb.simplepuzzlecube.ui.view.cube3d.rememberCube3DViewState
import com.mikeb.simplepuzzlecube.ui.view.theme.BgBottom
import com.mikeb.simplepuzzlecube.ui.view.theme.BgGlow
import com.mikeb.simplepuzzlecube.ui.view.theme.BgTop
import com.mikeb.simplepuzzlecube.ui.view.theme.Muted
import com.mikeb.simplepuzzlecube.ui.view.theme.Panel3
import com.mikeb.simplepuzzlecube.ui.view.theme.TextPrimary
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
    // The 3D camera, hoisted here so the panel's Recenter button can drive it. Kept
    // outside the `when (mode)` branch so the orbit survives a 3D → Net → 3D toggle.
    val cube3dViewState = rememberCube3DViewState()

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

    // The web body background: a vertical dark gradient with a soft radial glow up top.
    val background = Modifier.drawBehind {
        drawRect(Brush.verticalGradient(0f to BgTop, 1f to BgBottom))
        drawCircle(
            Brush.radialGradient(
                0f to BgGlow,
                1f to Color.Transparent,
                center = Offset(size.width * 0.3f, -size.height * 0.15f),
                radius = size.width * 1.2f
            ),
            radius = size.width * 1.2f,
            center = Offset(size.width * 0.3f, -size.height * 0.15f)
        )
    }
    val chipColors = FilterChipDefaults.filterChipColors(
        labelColor = Muted,
        selectedContainerColor = Panel3,
        selectedLabelColor = TextPrimary
    )

    Column(
        modifier = modifier.fillMaxSize().then(background).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        StatsRow(state)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            StatusPill(state, modifier = Modifier.weight(1f))
            FilterChip(
                selected = mode == ViewMode.Cube3D,
                onClick = { mode = ViewMode.Cube3D },
                label = { Text("3D") },
                colors = chipColors
            )
            FilterChip(
                selected = mode == ViewMode.Net,
                onClick = { mode = ViewMode.Net },
                label = { Text("Net") },
                colors = chipColors
            )
        }
        // The renderer flexes into whatever height the panel leaves over (the web's
        // stage/panel split, rotated for portrait).
        Box(
            modifier = Modifier.fillMaxWidth().weight(1f),
            contentAlignment = Alignment.Center
        ) {
            when (mode) {
                ViewMode.Cube3D -> Cube3DView(
                    state = state,
                    onUserMove = { face, isPrime -> viewModel.userMove(face, isPrime) },
                    onMoveSettled = viewModel::moveSettled,
                    modifier = Modifier.fillMaxSize(),
                    viewState = cube3dViewState
                )
                ViewMode.Net -> NetView(state.cubies, modifier = Modifier.fillMaxWidth())
            }
        }
        DriverControls(
            state = state,
            onScramble = viewModel::scramble,
            onSolve = viewModel::startSolve,
            onAbort = viewModel::abortSolve,
            onReset = viewModel::reset,
            onRecenter = if (mode == ViewMode.Cube3D) cube3dViewState::recenter else null
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
