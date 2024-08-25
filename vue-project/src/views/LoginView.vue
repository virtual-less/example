<template>
  <div>
    <div class="flex justify-center content-center" v-show="messageRef">
      <div role="alert" class="alert w-72 p-1" :class="messageTypeRef">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>{{messageRef}}</span>
      </div>
    </div>
    <div class="flex justify-center content-center mt-48">
      <div class="min-w-96">
        <div class="p-1">
          <div>用户名：</div>
          <input type="text" placeholder="username" v-model="usernameRef" class="input input-bordered w-full" />
        </div>
        <div class="p-1">
          <div>密码：</div>
          <input type="password" placeholder="password" v-model="passwordRef" class="input input-bordered w-full" />
        </div>
        <div class="flex justify-end p-1">
          <button class="btn btn-primary" @click="register">注册</button>
          <button class="btn btn-accent ml-1" @click="login">登陆</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const usernameRef = ref('')
  const passwordRef = ref('')
  const messageRef = ref('')
  const messageTypeRef = ref('alert-success')
  
  const getUserInfoJSON = ()=>{
    return JSON.stringify({
      username:usernameRef.value,
      password:passwordRef.value
    })
  }
  const register = async ()=>{
    const resp = await fetch('/api/user/register',{
      method:'post',
      headers:{
        "Content-Type":"application/json"
      },
      body:getUserInfoJSON()
    })
    const data = await resp.json()
    if (data.results) {
      messageTypeRef.value = 'alert-success'
      messageRef.value = '注册成功'
    } else {
      messageTypeRef.value = 'alert-error'
      messageRef.value = '注册失败'
    }
  }

  const login = async ()=>{
    const resp = await fetch('/api/user/login',{
      method:'post',
      headers:{
        "Content-Type":"application/json"
      },
      body:getUserInfoJSON()
    })
    const data = await resp.json()
    if(data.token) {
      localStorage.setItem('token',`Bearer ${data.token}`)
      router.push('/me')
    } else {
      messageTypeRef.value = 'alert-error'
      messageRef.value = '用户名或密码错误'
    }
  }
</script>
