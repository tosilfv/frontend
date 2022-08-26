import React, { Component } from 'react'
import '../styles/theme/light/Message.css'

class Message extends Component {
  constructor(props) {
    super(props)
    this.handleRemove = this.handleRemove.bind(this)
  }
  handleRemove() {
    this.props.removeMessage()
  }
  render() {
    const {
      gameover,
      message
    } = this.props
    return (
      <div className='Message'>
        {gameover ? (
          <></>
          ) : (
          message &&
            <button
              className='Message-close'
              onClick={this.handleRemove}
              >
                X
            </button>
          )
        }
        <p>{message}</p>
      </div>
    )
  }
}

export default Message