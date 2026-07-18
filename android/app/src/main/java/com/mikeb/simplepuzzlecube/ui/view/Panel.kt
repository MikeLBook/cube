// The control panel — analog of ../src/presentations/3DWeb/panel.ts + the panel markup
// in 3DWeb.html, styled with the same design tokens: stat cards, the status pill (border
// and label tinted by status color), and the three button variants (primary = accent-x,
// normal = panel-2 with border, ghost = transparent with border). Pure renders of
// UiState; every intent is a ViewModel call.
package com.mikeb.simplepuzzlecube.ui.view

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mikeb.simplepuzzlecube.ui.model.CubeMoveKey
import com.mikeb.simplepuzzlecube.ui.model.MoveKey
import com.mikeb.simplepuzzlecube.ui.view.theme.AccentX
import com.mikeb.simplepuzzlecube.ui.view.theme.AccentY
import com.mikeb.simplepuzzlecube.ui.view.theme.AccentZ
import com.mikeb.simplepuzzlecube.ui.view.theme.Muted
import com.mikeb.simplepuzzlecube.ui.view.theme.Panel2
import com.mikeb.simplepuzzlecube.ui.view.theme.PanelBorder
import com.mikeb.simplepuzzlecube.ui.view.theme.TextPrimary
import com.mikeb.simplepuzzlecube.ui.viewmodel.Status
import com.mikeb.simplepuzzlecube.ui.viewmodel.UiState

data class StatusMeta(val label: String, val color: Color?)

// config.ts STATUS_META; null color = the default text color (web: var(--text)).
val STATUS_META: Map<Status, StatusMeta> = mapOf(
    Status.free to StatusMeta("Free Play", null),
    Status.ready to StatusMeta("Ready", null),
    Status.scrambling to StatusMeta("Scrambling…", AccentX),
    Status.solving to StatusMeta("Solving…", AccentZ),
    Status.solved to StatusMeta("Solved!", AccentY)
)

// panel.ts timeText.
fun timeText(elapsedMs: Long): String {
    val total = elapsedMs / 1000
    val mm = (total / 60).toInt()
    val ss = (total % 60).toInt()
    val t = ((elapsedMs % 1000) / 100).toInt()
    val ssStr = (if (mm > 0 && ss < 10) "0" else "") + ss
    return (if (mm > 0) "$mm:" else "") + ssStr + "." + t
}

// ---------- building blocks ----------

private enum class ButtonKind { Primary, Normal, Ghost }

@Composable
private fun PanelButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    kind: ButtonKind = ButtonKind.Normal,
    mutedLabel: Boolean = false
) {
    val container = when (kind) {
        ButtonKind.Primary -> AccentX
        ButtonKind.Normal -> Panel2
        ButtonKind.Ghost -> Color.Transparent
    }
    val content = when {
        mutedLabel -> Muted
        kind == ButtonKind.Primary -> Color.White
        else -> TextPrimary
    }
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier,
        shape = RoundedCornerShape(9.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = container,
            contentColor = content,
            // web .btn:disabled — same face at 40% opacity
            disabledContainerColor = container.copy(alpha = container.alpha * 0.4f),
            disabledContentColor = content.copy(alpha = 0.4f)
        ),
        border = if (kind == ButtonKind.Primary) null else BorderStroke(1.dp, PanelBorder),
        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 10.dp)
    ) {
        Text(
            label,
            maxLines = 1,
            fontWeight = if (kind == ButtonKind.Primary) FontWeight.Bold else FontWeight.SemiBold
        )
    }
}

@Composable
private fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Panel2)
            .border(1.dp, PanelBorder, RoundedCornerShape(12.dp))
            .padding(horizontal = 14.dp, vertical = 10.dp)
    ) {
        Text(
            label.uppercase(),
            color = Muted,
            fontSize = 10.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.SemiBold
        )
        Text(value, color = TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
    }
}

// ---------- panel sections ----------

@Composable
fun StatsRow(state: UiState, modifier: Modifier = Modifier) {
    Row(modifier = modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        StatCard("Time", timeText(state.elapsedMs), Modifier.weight(1f))
        StatCard("Moves", state.moveCount.toString(), Modifier.weight(1f))
    }
}

@Composable
fun StatusPill(state: UiState, modifier: Modifier = Modifier) {
    val meta = STATUS_META.getValue(state.status)
    val color = meta.color ?: TextPrimary
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Panel2)
            .border(1.dp, color.copy(alpha = 0.75f), RoundedCornerShape(10.dp))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(color))
        Text(
            meta.label,
            color = color,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            modifier = Modifier.padding(start = 8.dp)
        )
    }
}

@Composable
fun DriverControls(
    state: UiState,
    onScramble: () -> Unit,
    onSolve: () -> Unit,
    onAbort: () -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier,
    // Non-null only when the active renderer has a camera to recenter (the 3D view);
    // the web's btn-recenter, rendered inline with the driver buttons to save vertical
    // space, and locked with the rest of the panel while a driver runs.
    onRecenter: (() -> Unit)? = null
) {
    // While the solver is active, every control is locked except Abort; Abort is live only
    // during a solve and shows "Aborting…" while the abort unwinds (which isn't instant).
    val locked = state.solverActive
    Row(modifier = modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        PanelButton(
            "Scramble",
            onClick = onScramble,
            enabled = !locked,
            kind = ButtonKind.Primary,
            modifier = Modifier.weight(1f)
        )
        if (state.solverActive) {
            PanelButton(
                if (state.aborting) "Aborting…" else "Abort",
                onClick = onAbort,
                enabled = !state.aborting,
                mutedLabel = state.aborting,
                modifier = Modifier.weight(1f)
            )
        } else {
            PanelButton("Solve", onClick = onSolve, modifier = Modifier.weight(1f))
        }
        PanelButton(
            "Reset",
            onClick = onReset,
            enabled = !locked,
            kind = ButtonKind.Ghost,
            modifier = Modifier.weight(1f)
        )
        if (onRecenter != null) {
            PanelButton(
                "Recenter",
                onClick = onRecenter,
                enabled = !locked,
                kind = ButtonKind.Ghost,
                modifier = Modifier.weight(1f)
            )
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
                PanelButton(
                    key.name + if (prime) "′" else "",
                    onClick = { onFaceMove(key) },
                    enabled = !locked,
                    modifier = Modifier.weight(1f)
                )
            }
            PanelButton(
                "′",
                onClick = { onPrimeChange(!prime) },
                kind = if (prime) ButtonKind.Normal else ButtonKind.Ghost,
                mutedLabel = !prime,
                modifier = Modifier.weight(1f)
            )
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf(
                "⟲ Spin" to CubeMoveKey.spinLeft,
                "⟳ Spin" to CubeMoveKey.spinRight,
                "↑ Roll" to CubeMoveKey.rollUp,
                "↓ Roll" to CubeMoveKey.rollDown
            ).forEach { (label, key) ->
                PanelButton(
                    label,
                    onClick = { onCubeMove(key) },
                    enabled = !locked,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}
