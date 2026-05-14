package com.familycare.guardian

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun GuardianDashboardScreen(
    onNavigateToChat: () -> Unit = {}
) {
    // 더미 데이터
    val elderName = "김순자 어머니"
    val lastUpdate = "5분 전"
    val showAlert = true
    
    val activityData = HealthCardData(
        title = "활동량",
        value = "1,200 걸음",
        status = "마지막 움직임: 2시간 전",
        statusType = StatusType.DANGER
    )
    
    val heartData = HealthCardData(
        title = "심박수",
        value = "72 bpm",
        status = "정상",
        statusType = StatusType.NORMAL
    )
    
    val sleepData = HealthCardData(
        title = "수면",
        value = "7시간 20분",
        status = "정상",
        statusType = StatusType.NORMAL
    )

    Scaffold(
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1976D2))
                    .padding(16.dp)
            ) {
                Text(
                    text = elderName,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "마지막 업데이트: $lastUpdate",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
        },
        bottomBar = {
            BottomNav(selectedIndex = 0, onNavigateToChat = onNavigateToChat)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // 이상 감지 배너
            if (showAlert) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF44336))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚠️ 2시간 이상 움직임이 감지되지 않았어요",
                        color = Color.White,
                        fontSize = 14.sp
                    )
                }
            }

            // 건강 카드들
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                HealthCard(data = activityData)
                Spacer(modifier = Modifier.height(12.dp))
                HealthCard(data = heartData)
                Spacer(modifier = Modifier.height(12.dp))
                HealthCard(data = sleepData)
            }
        }
    }
}

@Composable
fun HealthCard(data: HealthCardData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .then(
                    if (data.statusType == StatusType.DANGER) {
                        Modifier.padding(start = 4.dp)
                    } else Modifier
                )
        ) {
            Text(
                text = data.title,
                fontSize = 14.sp,
                color = Color(0xFF666666)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = data.value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            
            val bgColor = when (data.statusType) {
                StatusType.NORMAL -> Color(0xFFE8F5E9)
                StatusType.WARNING -> Color(0xFFFFF3E0)
                StatusType.DANGER -> Color(0xFFFFEBEE)
            }
            
            val textColor = when (data.statusType) {
                StatusType.NORMAL -> Color(0xFF2E7D32)
                StatusType.WARNING -> Color(0xFFF57C00)
                StatusType.DANGER -> Color(0xFFC62828)
            }
            
            Box(
                modifier = Modifier
                    .background(bgColor, RoundedCornerShape(4.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = data.status,
                    fontSize = 13.sp,
                    color = textColor
                )
            }
        }
    }
}

@Composable
fun BottomNav(selectedIndex: Int, onNavigateToChat: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(vertical = 12.dp)
    ) {
        NavButton("홈", selectedIndex == 0) {}
        NavButton("채팅", selectedIndex == 1, onNavigateToChat)
        NavButton("알림", selectedIndex == 2) {}
        NavButton("설정", selectedIndex == 3) {}
    }
}

@Composable
fun RowScope.NavButton(text: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .weight(1f)
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 13.sp,
            color = if (selected) Color(0xFF1976D2) else Color.Gray,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

data class HealthCardData(
    val title: String,
    val value: String,
    val status: String,
    val statusType: StatusType
)

enum class StatusType {
    NORMAL, WARNING, DANGER
}
