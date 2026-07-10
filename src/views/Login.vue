<template>
  <div class="login-page">
    <header class="login-header">
      <div class="login-brand">
        <div class="brand-mark" aria-hidden="true">
          <span class="mark-stroke mark-blue"></span>
          <span class="mark-stroke mark-cyan"></span>
          <span class="mark-stroke mark-green"></span>
        </div>
        <div class="brand-title">签名验签服务器</div>
      </div>
    </header>

    <main class="login-main">
      <form class="login-panel" @submit.prevent="handleLogin">
        <h1>账号密码登录</h1>

        <input
          v-model.trim="form.username"
          class="login-input"
          type="text"
          autocomplete="username"
          placeholder="请输入账号"
        />
        <input
          v-model="form.password"
          class="login-input"
          type="password"
          autocomplete="current-password"
          placeholder="请输入密码"
        />

        <button class="login-button" type="submit">登录</button>

        <button class="ukey-login" type="button">UKEY登录</button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  router.replace('/dashboard')
}
</script>

<style lang="scss" scoped>
.login-page {
  min-width: 1200px;
  min-height: 100vh;
  background: #dce4ed;
}

.login-header {
  height: 70px;
  background: #fff;
  display: flex;
  align-items: center;
  padding-left: 164px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-mark {
  position: relative;
  width: 77px;
  height: 44px;
  flex: 0 0 77px;
}

.mark-stroke {
  position: absolute;
  bottom: 5px;
  width: 17px;
  height: 48px;
  border-radius: 999px;
  transform: rotate(45deg);
  box-shadow: 0 7px 13px rgba(37, 123, 255, 0.14);
}

.mark-blue {
  left: 10px;
  background: linear-gradient(180deg, #8d50ff 0%, #2d75ff 100%);
}

.mark-cyan {
  left: 34px;
  background: linear-gradient(180deg, #27b7ff 0%, #39e4ff 100%);
}

.mark-green {
  left: 58px;
  height: 31px;
  background: linear-gradient(180deg, #53e6a6 0%, #4bd2d5 100%);
}

.brand-title {
  color: #000;
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
  white-space: nowrap;
}

.login-main {
  position: relative;
  min-height: calc(100vh - 70px);
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  &::before {
    left: -118px;
    bottom: 132px;
    width: 850px;
    height: 500px;
    background: rgba(230, 236, 243, 0.56);
  }

  &::after {
    right: -120px;
    top: -170px;
    width: 880px;
    height: 590px;
    background: rgba(205, 215, 226, 0.46);
  }
}

.login-panel {
  position: absolute;
  top: 190px;
  left: 50%;
  z-index: 1;
  width: 392px;
  height: 446px;
  margin-left: -196px;
  padding: 49px 22px 28px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 8px 20px rgba(29, 47, 66, 0.18);

  h1 {
    margin: 0 0 35px;
    color: #000;
    font-size: 22px;
    font-weight: 700;
    line-height: 30px;
  }
}

.login-input {
  width: 348px;
  height: 46px;
  display: block;
  margin-bottom: 14px;
  padding: 0 15px;
  color: #1f2d3d;
  background: #fff;
  border: 1px solid #d8dfe8;
  border-radius: 0;
  font-size: 14px;
  line-height: 44px;
  outline: none;

  &::placeholder {
    color: #b7c0ca;
  }

  &:focus {
    border-color: #387ee8;
  }
}

.login-button {
  width: 348px;
  height: 46px;
  margin-top: 22px;
  color: #fff;
  background: #387ee8;
  border: 0;
  border-radius: 2px;
  font-size: 14px;
  line-height: 46px;
  cursor: pointer;

  &:hover {
    background: #2f73dd;
  }
}

.ukey-login {
  position: absolute;
  right: 28px;
  bottom: 27px;
  padding-left: 14px;
  color: #33465d;
  background: transparent;
  border: 0;
  border-left: 2px solid #d8dfe8;
  font-size: 14px;
  line-height: 14px;
  cursor: pointer;

  &:hover {
    color: #387ee8;
  }
}
</style>
