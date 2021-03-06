<template>
  <linky-base>
    <linky-nav>
      <a tabindex="1" @click="showAdd = true" @keyup.enter="showAdd = true">Add Link</a>
      <a tabindex="1" @click="showSettings = true" @keyup.enter="showSettings = true">Settings</a>
      <a tabindex="1" v-if="authenticated" @click="logout" @keyup.enter="logout">Logout</a>
      <router-link to="/login" v-else>Login</router-link>
    </linky-nav>

    <nav class="list-options">
      <div class="search-option-section">
        <a class="icon"><img class="searchicon" src="static/magnifying-glass.svg"></a>
        <input class="search" @focusin="searchActive" @blur="doneSearching" id="search" placeholder="search" type="search" v-model="query">
      </div>
      <div class="list-archive-option-section">
        <router-link :class="{ inactive: parentName !== 'list' }" to="/list">List</router-link>
        <router-link :class="{ inactive: parentName !== 'archive' }" to="/archive">Archive</router-link>
      </div>
    </nav>

    <ul class="link-container">
      <slot></slot>
    </ul>

    <linky-help-modal :show="showHelp" @show="showHelp = true" @closed="showHelp = false"></linky-help-modal>
    <linky-settings-modal :show="showSettings" @show='showSettings = true' @closed="showSettings = false"></linky-settings-modal>
    <linky-add-link-modal :show="showAdd || addLinkErrors" @show='showAdd = true' @closed="showAdd = false"></linky-add-link-modal>
  </linky-base>
</template>

<script>
import linkyBase from './Base.vue'
import linkyNav from './Nav.vue'
import linkyHelpModal from './helpModal.vue'
import linkySettingsModal from './SettingsModal.vue'
import linkyAddLinkModal from './addLinkModal.vue'
import axios from 'axios'

import { handle_event } from '../nav.js'

export default {
  name: 'list-base',
  components: {
    linkyBase,
    linkyNav,
    linkyHelpModal,
    linkySettingsModal,
    linkyAddLinkModal,
  },
  data () {
    return {
      query: '',
      showAdd: false,
      showSettings: false,
      showHelp: false,
      searching: false,
    }
  },
  props: {
    parentName: {
      type: String,
      required: true,
    },
  },
  mounted () {
    this.$store.dispatch('refreshLinks')
    document.addEventListener('paste', this.pasteHandler)
    document.addEventListener('keydown', this.keybindsHandler)
  },
  beforeDestroy () {
    document.removeEventListener('paste', this.pasteHandler)
    document.removeEventListener('keydown', this.keybindsHandler)
  },
  computed: {
    authenticated () {
      return this.$store.state.user.authenticated
    },
    enableKeybinds () {
      return !(this.$store.state.keybindsDisabled > 0) && !this.showAdd && !this.showSettings && !this.showHelp && !this.searching
    },
    enablePaste () {
      return Object.keys(this.$store.state.errors.addLink).length === 0 && this.enableKeybinds
    },
    addLinkErrors () {
      return Object.keys(this.$store.state.errors.addLink).length > 0
    },
  },
  watch: {
    query () {
      this.$store.commit('setQuery', this.query)
    },
  },
  methods: {
    logout () {
      this.$store.commit('setLoadingProgress', 30)
      axios.post('/rest-auth/logout/', {},
        {headers: {'Authorization': 'Token ' + localStorage.getItem('token')}})
      .then(response => {
        console.info('logged out')
        this.$store.commit('logout')
        this.$router.replace('/login')
        this.$store.commit('notify', {'message': 'Logged out', 'level': 'success'})
        this.$store.commit('setLoadingProgress', 100)
      })
      .catch(error => {
        this.$store.commit('notify', {'message': 'Problem Logging Out', 'level': 'warning'})
        console.warn('Problem logging out user.', error)
        this.$store.commit('logoutErrors', error)
        this.$store.commit('setLoadingProgress', 0)
      })
    },
    pasteHandler (e) {
      const paste = e.clipboardData.getData('text')
      if (paste.length > 0 && this.enablePaste) {
        this.$store.dispatch('addLink', paste).then(console.log('Added link from paste'))
      }
    },
    searchActive () {
      this.searching = true
    },
    doneSearching () {
      this.searching = false
    },
    keybindsHandler (event) {
      // we should always be able to <esc> the search to nav the list again
      const is_esc_key = event.keyCode === 27
      const is_terminal_esc = event.keyCode === 219 && event.ctrlKey
      if (is_esc_key || is_terminal_esc) {
        document.querySelector('input.search').blur()
      }

      if (this.enableKeybinds) {
        handle_event(event)
        // l or h - switch list
        const modifierKeyPressed = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
        if ((event.keyCode === 76 || event.keyCode === 72) && !modifierKeyPressed) {
          if (this.$router.currentRoute.path === '/list') {
            this.$router.push('/archive')
          } else if (this.$router.currentRoute.path === '/archive') {
            this.$router.push('/list')
          }
        }
      }
    },
  },
}

</script>

<style lang="scss">
@import '../styles/_partials.scss';

$text-gray: #444;
$max-width-main-content: 40em;

// background colors
$sepia: #f8f2e3;
$grayblack: #3c3c3c;

$light-gray: #eee;

html {
  color: $text-gray;
  font-family: $font-family;
  font-size: $base-font-size;
}

.sepia {
  background-color: $sepia;
}

.grayblack {
  background-color: $grayblack;
  color: $light-gray;
}

.white {
  background-color: white;
}

a {
  color: inherit;
}

form {
  margin-bottom: 0;
}

.searchicon {
  width: 1rem;
}

.link-container {
  list-style-type: none;
  margin: 0 auto;
  max-width: 40em;
  padding-left: 0;
  overflow-wrap: break-word;
  padding-top: 0;
  margin-bottom: .5rem;
}

// styling for search <input>
.search {
  width: 60%;

  &:focus {
    box-shadow: none;
  }

}

input {
  font-size: 1rem;
  font-family: $font-family;
}

.main-nav {
  a {
    padding: .5rem .5rem;
    color: inherit;
    text-decoration: none;

    &:hover {
      color: lighten($text-gray, 10%);
    }

    &:not(:first-child) {
      margin-left: .5rem;
    }

  }

  h1 {
    margin-bottom: 0;
    margin-top: 0;
  }

  .title {
    font-style: italic;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

// list, archive, or search
.list-options {
  margin: 0 auto;
  max-width: $max-width-main-content;
  display: flex;
  justify-content: space-between;

  a {
    padding: 1rem .5rem;
    color: inherit;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      color: lighten($text-gray, 10%);
    }

    &:not(:first-child) {
      margin-left: .5rem;
    }
  }

  .inactive {
    color: lighten($text-gray, 30%);
    font-style: italic;

    &:hover {
      color: lighten($text-gray, 20%);
    }
  }

  .search-option-section {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .list-archive-option-section {
    display: flex;
    align-items: center;
  }

}
</style>
