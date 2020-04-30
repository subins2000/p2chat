<template>
  <div class="container">
    <div id="app" class="row">
      <div class="col-xl-8 col-lg-12 col-md-6 col-sm-12 col-12">
        <div class="panel panel-info">
          <div class="panel-heading">
            <span class="badge">{{ Object.keys(members).length }}</span> Members
          </div>
          <div class="panel-body">
            <div v-if="joined">
              <em><span v-text="status"></span></em>
              <div class="chat-wrapper" ref="chatWrapper">
                <ul class="chat">
                  <li class="left clearfix" v-for="message in messages">
                    <div class="chat-body clearfix">
                      <div class="header">
                        <strong class="primary-font">
                          {{ message.username }}
                        </strong>
                      </div>
                      <p>
                        {{ message.message }}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="panel-footer">
                <div class="input-group">
                  <input id="btn-input" type="text" name="message" class="form-control input-sm" placeholder="Type your message here..." v-model="newMessage" ref="messageInputField" @keyup.enter="sendMessage">
                  
                  <span class="input-group-btn">
                    <button class="btn btn-primary btn-sm" id="btn-chat" @click="sendMessage">Send</button>
                  </span>
                </div><br/>
                <div class="input-group">
                  Members : 
                  <span v-for="member in members"><b>{{ member }}</b>, </span>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="form-group">
                <label>Room Name</label>
                <input type="text" class="form-control" placeholder="chat room name" v-model="room" @keyup.enter="joinChat">
              </div>
              <div class="form-group">
                <label>Username</label>
                <input type="text" class="form-control" placeholder="enter your username to join chat" v-focus v-model="username" @keyup.enter="joinChat">
              </div>
              <button class="btn btn-primary" @click="joinChat">JOIN</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const P2PT = require('p2pt')

module.exports = {
  data () {
    return {
      joined: false,
      room: 'general',
      username: '',
      members: {},
      newMessage: '',
      messages: [],
      status: ''
    }
  },

  methods: {
    init () {
      this.peers = {}

      let announceURLs = [
        "wss://tracker.openwebtorrent.com",
        "wss://tracker.sloppyta.co:443/announce",
        "wss://tracker.novage.com.ua:443/announce",
        "wss://tracker.btorrent.xyz:443/announce",
      ]
      if (window.location.hostname === "localhost") {
        announceURLs = ["ws://localhost:5000"]
      }

      this.p2pt = new P2PT(announceURLs, 'p2chat' + this.room)
    },

    joinChat () {
      if (this.room.trim() === '') {
        return
      }

      this.init()
      this.joined = true
      this.status = `${this.username} joined the chat`
      this.usernames = {}

      this.listen()

      this.$nextTick(() => {
        this.$refs.messageInputField.focus()
      })
    },

    sendMessage () {
      if (this.newMessage.trim() === '') {
        return
      }

      const message = {
        username: this.username,
        message: this.newMessage
      }

      // Clear input field
      this.newMessage = ''

      for (var key in this.peers) {
        this.p2pt.send(this.peers[key], JSON.stringify(message))
      }

      this.messages.push(message)
      this.scrollDown()
    },

    listen () {
      const $this = this
      this.p2pt.on('peerconnect', (peer) => {
        $this.peers[peer.id] = peer
      })

      this.p2pt.on('peerclose', (peer) => {
        delete $this.peers[peer.id]
        delete $this.members[peer.id]
      })

      this.p2pt.on('msg', (peer, msg) => {
        msg = JSON.parse(msg)
        
        $this.members[peer.id] = msg.username
        $this.messages.push({
          username: msg.username,
          message: msg.message
        })
        $this.scrollDown()
      })
      this.p2pt.start()
    },

    scrollDown () {
      this.$nextTick(() => {
        var elem = this.$refs.chatWrapper
        elem.scrollTop = elem.clientHeight + elem.scrollHeight
      })
    }
  }
}
</script>