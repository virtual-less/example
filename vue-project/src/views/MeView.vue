<template>
  <div class="p-10">
    <h1>Hello!{{ usernameRef }}</h1>
    <button class="btn btn-primary mt-1" @click="back">返回</button>
    <button class="btn btn-accent mt-1 ml-1" @click="goChat">进入聊天室</button>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usernameRef = ref('获取用户信息中...')
onMounted(async () => {
  const resp = await fetch('/api/user/getUserInfoByToken',{
    headers:{
      Authorization:localStorage.getItem('token')
    }
  })
  const data = await resp.json()
  usernameRef.value = data.username
})

const back = ()=>{
  router.push('/')
}
const goChat = ()=>{
  router.push('/chat')
}
</script>
