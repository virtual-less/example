<template>
  <div>
    <button class="btn btn-warning m-2" @click="cancel">退出登陆</button> <span>您的用户名是：{{ usernameRef }}</span>
    <div class="flex flex-row h-screen w-screen">
      <div class="flex-grow h-4/5 p-2">
        <div class="w-full h-4/5 border-violet-500 border-2 rounded-md overscroll-auto overflow-auto">
          <div v-for="message in messageListComputed" :key="message.message">
            <div class="chat chat-start p-2" v-if="message.from!==usernameRef">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full border-white border-2 p-1">
                {{message.from}}
              </div>
            </div>
            <div class="chat-bubble">{{message.message}}</div>
          </div>
          <div class="chat chat-end p-2"  v-if="message.from===usernameRef">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full border-white border-2 p-1">
                {{message.from}}
              </div>
            </div>
            <div class="chat-bubble">{{message.message}}</div>
          </div>
          </div>
        </div>
        <div class="w-full mt-1">
          <textarea class="textarea textarea-primary w-full" placeholder="请发送消息" v-model="sendMessageRef" @keyup="sendMessage"></textarea>
        </div>
      </div>
      <div class="h-4/5 w-48 p-2">
        <div class="w-full h-4/5 border-violet-500 border-2 rounded-md overscroll-auto p-2">
          <div class=" border-white border-2 p-1" :key="userName" v-for="userName in userListRef">
            <div class="chat-image avatar" @click="switchUser(userName)">
              <div class="w-10 rounded-full border-white border-2 p-1">
                {{userName}}
              </div>
              <span class="p-2">{{userName}}<span v-if="userName===toUserNameRef">{{'(选中)'}}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usernameRef = ref('')
const messageMapReactive = reactive({})
const userListRef = ref([])
const toUserNameRef = ref('')
const sendMessageRef = ref('')

const messageListComputed = computed(()=>{
  return messageMapReactive[toUserNameRef.value] || []
})

let readMessageTime = Date.now()
let ws = null

const getUserName = async ()=>{
  const resp = await fetch('/api/user/getUserInfoByToken',{
    headers:{
      Authorization:localStorage.getItem('token')
    }
  })
  const data = await resp.json()
  return data.username
}

const switchUser = async (userName)=>{
  toUserNameRef.value = userName
}

const pushmessageMap = (userName, msg)=>{
  if(!messageMapReactive[userName]){messageMapReactive[userName]=[]}
  messageMapReactive[userName].push(msg)
}

const sendMessage = (e)=>{
  if(!toUserNameRef.value){
    throw new Error('请先选择用户')
  }
  if(e.key==='Enter'){
    const msg = {
        from:usernameRef.value,
        to:toUserNameRef.value,
        message:sendMessageRef.value,
      }
    ws.send(JSON.stringify({
      type:'send',
      data:msg
    })); 
    pushmessageMap(toUserNameRef.value, msg)
    sendMessageRef.value = ''
  }
}

const getUserNameList = async ()=>{
  const resp = await fetch('/api/user/getUserNameList',{
    headers:{
      Authorization:localStorage.getItem('token')
    }
  })
  const data = await resp.json()
  return data.data
}




onMounted(async () => {
  usernameRef.value = await getUserName()
  userListRef.value = await getUserNameList()
  await new Promise((reslove)=>{
    ws = new WebSocket(`ws://${window.location.host}/api/chat/message`)
    ws.onopen = function(){
      reslove(true)
    }
  })
  ws.onmessage = function(e){
    const data = JSON.parse(e.data)
    if(data.type==='receive') {
      for(const msg of data.data) {
        pushmessageMap(msg.from,msg)
        pushmessageMap(msg.to,msg)
      }
    }
  }
  setInterval(()=>{
    ws.send(JSON.stringify({
      type:'receive',
      data:{username:usernameRef.value, createTime:readMessageTime}
    })); 
    readMessageTime = Date.now()
  },3000)
})


const cancel = ()=>{
  localStorage.removeItem('token')
  router.push('/')
}
</script>
