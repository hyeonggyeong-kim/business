package com.familycare.elder

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ElderHomeScreen() {
    // 더미 데이터
    val checkCount = 2
    val memberNames = "아들·딸"
    val memberDetail = "김철수, 김민지"
    
    val latestMsg = MsgPreview(
        sender = "딸 (김민지)",
        content = "엄마 내일 퇴근하고 들를게요!\n맛있는 거 사갈게요 😊"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // 메인 메시지
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(bottom = 48.dp)
        ) {
            Text(
                text = "오늘 $memberNames\n$checkCount 명이\n확인했어요",
                fontSize = 36.sp,
                lineHeight = 50.sp,
                textAlign = TextAlign.Center,
                color = Color(0xFF1976D2),
                fontWeight = FontWeight.Medium
            )
            
            Text(
                text = "💙",
                fontSize = 48.sp,
                modifier = Modifier.padding(top = 16.dp)
            )
            
            Text(
                text = memberDetail,
                fontSize = 24.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 12.dp)
            )
        }

        // 메시지 미리보기
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = latestMsg.sender,
                    fontSize = 20.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
                Text(
                    text = latestMsg.content,
                    fontSize = 26.sp,
                    lineHeight = 39.sp,
                    color = Color(0xFF333333)
                )
            }
        }

        // 메시지 보기 버튼
        Button(
            onClick = {
                // TODO: 메시지 목록 화면으로 이동
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1976D2))
        ) {
            Text(
                text = "가족 메시지 전체 보기",
                fontSize = 28.sp,
                color = Color.White
            )
        }
    }
}

data class MsgPreview(
    val sender: String,
    val content: String
)
