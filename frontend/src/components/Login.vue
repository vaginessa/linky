<template>
  <linky-base>
    <linky-nav></linky-nav>
    <div class="container">
      <div>
        <h1>Login</h1>
        <form slot='body' action="" method="post" @submit.prevent='login'>
          <label>Email
            <input v-focus="emailFocused" @focus='emailFocused = true' @blur='emailFocused = false' type='email' name='email' placeholder='name@example.com' required v-model='email'>
          </label>
          <label>Password
            <input type='password' name='password' required v-model='password' placeholder="super secret password">
          </label>
          <input type='submit' class="button" value='Login'>
          <br>
          <div class="forgot">
            <router-link to="/reset">Forgot Password?</router-link>
          </div>
          <linky-error-display :errors="inputErrors"></linky-error-display>
        </form>
      </div>
    </div>
  </linky-base>
</template>


<script>
import { focus } from 'vue-focus'
import axios from 'axios'
import { normalize } from '../utilities.js'

import linkyBase from './Base.vue'
import linkyNav from './Nav.vue'
import linkyErrorDisplay from './ErrorDisplay.vue'

export default {
  directives: {
    focus,
  },
  name: 'login',
  components: {
    linkyBase,
    linkyNav,
    linkyErrorDisplay,
  },
  data () {
    return {
      email: '',
      password: '',
      emailFocused: true,
      inputErrors: {},
    }
  },
  filters: {
    normalize,
  },
  methods: {
    login () {
      const credentials = {'email': this.email, 'password': this.password}
      axios.post('/rest-auth/login/', credentials)
        .then(response => {
          this.$store.commit('notify', {'message': 'Login Successful', 'level': 'success'})
          console.info('Login successful')
          this.$store.commit('loginSuccessful', response.data.key)
          // fetch links once user is logged in
          this.$store.dispatch('refreshLinks')
          this.inputErrors = null
          this.$router.replace('/list')
        })
        .catch(error => {
          console.warn('problem logging in', error)
          this.inputErrors = error.response.data
          this.$store.commit('notify', {'message': 'Problem Logging In', 'level': 'warning', 'sticky': true})
        })
    },
  },
}
</script>

<style lang='scss' scoped>
@import '../styles/_partials.scss';

.container {
  display: flex;
  justify-content: center;
  margin-left: 5px;
}

input[type="submit"] {
  width: auto;
}

.forgot {
  padding-top: .5em;
}

.warning {
  font-style: italic;
}

label {
  display: inline-block;
}

</style>
