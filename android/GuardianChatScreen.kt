package com.familycare.guardian

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
fun GuardianChatScreen(
    onBack: () -> Unit = {}
) {
    // 더미 메시지
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMsg("딸 (김민지)", "내가 전화해볼게", "14:05", false),
                ChatMsg("나", "주무시고 계셨대요", "14:12", true),
                ChatMsg("아들 (김철수)", "다행이네요. 저녁에 제가 들를게요", "14:15", false)
            )
        )
    }
    
    var inputText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            Column {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1976D2))
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onBack) {
                        Text("←", color = Color.White, fontSize = 20.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "가족 채팅",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                
                // 알림 컨텍스트
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFFF3E0))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚠️ 오후 2시 – 움직임 없음 감지됨",
                        fontSize = 13.sp,
                        color = Color(0xFFF57C00)
                    )
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // 채팅 목록
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(msg)
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            // 빠른 답장
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                QuickReplyBtn("내가 전화할게") { inputText = it }
                QuickReplyBtn("확인했어") { inputText = it }
                QuickReplyBtn("괜찮으신 것 같아") { inputText = it }
            }

            // 입력창
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("메시지 입력") },
                    shape = RoundedCornerShape(20.dp),
                    colors = TextFieldDefaults.colors(
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            messages = messages + ChatMsg("나", inputText, "방금", true)
                            inputText = ""
                            // TODO: API 전송
                        }
                    },
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text("전송")
                }
            }
        }
    }
}

@Composable
fun ChatBubble(msg: ChatMsg) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (msg.isMe) Alignment.End else Alignment.Start
    ) {
        Text(
            text = "${msg.sender} · ${msg.time}",
            fontSize = 12.sp,
            color = Color.Gray
        )
        Spacer(modifier = Modifier.height(4.dp))
        
        Box(
            modifier = Modifier
                .background(
                    if (msg.isMe) Color(0xFF1976D2) else Color.White,
                    RoundedCornerShape(8.dp)
                )
                .padding(12.dp)
                .widthIn(max = 250.dp)
        ) {
            Text(
                text = msg.content,
                color = if (msg.isMe) Color.White else Color.Black
            )
        }
    }
}

@Composable
fun QuickReplyBtn(text: String, onClick: (String) -> Unit) {
    Button(
        onClick = { onClick(text) },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE3F2FD)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Text(text, fontSize = 13.sp, color = Color.Black)
    }
}

data class ChatMsg(
    val sender: String,
    val content: String,
    val time: String,
    val isMe: Boolean
)
