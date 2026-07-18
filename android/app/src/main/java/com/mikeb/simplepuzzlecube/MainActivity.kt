package com.mikeb.simplepuzzlecube

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.mikeb.simplepuzzlecube.ui.view.CubeScreen
import com.mikeb.simplepuzzlecube.ui.view.theme.SimplePuzzleCubeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SimplePuzzleCubeTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    CubeScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}
