<template>
  <div id="app" class="row">
    <div class="col-md-6 col-md-offset-3">
      <div class="panel panel-info">
        <div class="panel-heading">
          <span class="badge">{{ members }}</span> Members
        </div>
        <div class="panel-body">
          <div v-if="joined">
            <em><span v-text="status"></span></em>
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
            <div class="panel-footer">
              <div class="input-group">
                <input id="btn-input" type="text" name="message" class="form-control input-sm" placeholder="Type your message here..." v-model="newMessage" @keyup.enter="sendMessage">
                
                <span class="input-group-btn">
                  <button class="btn btn-primary btn-sm" id="btn-chat" @click="sendMessage">Send</button>
                </span>
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
              <input type="text" class="form-control" placeholder="enter your username to join chat" v-model="username" @keyup.enter="joinChat">
            </div>
            <button class="btn btn-primary" @click="joinChat">JOIN</button>
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
      members: 0,
      newMessage: '',
      messages: [],
      status: ''
    }
  },

  methods: {
    init () {
      this.peers = {}
      this.p2pt = new P2PT(['ws://localhost:5000'], this.room)
    },

    joinChat () {
      this.init()
      this.joined = true
      this.status = `${this.username} joined the chat`

      this.listen()
    },

    sendMessage () {
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
    },

    listen () {
      const $this = this
      this.p2pt.on('peerconnect', (peer) => {
        $this.members = $this.peers.length
        $this.peers[peer.id] = peer
      })

      this.p2pt.on('peerclose', (peer) => {
        $this.members = $this.peers.length
        delete $this.peers[peer.id]
      })

      this.p2pt.on('msg', (peer, msg) => {
        $this.members = $this.peers.length

        msg = JSON.parse(msg)
        
        $this.messages.push({
          username: msg.username,
          message: msg.message
        })
      })
      this.p2pt.start()
    }
  }
}
</script>