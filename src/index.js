import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import InputTrigger from 'react-input-trigger';


class App extends Component {
    constructor() {
        super();

        this.state = {
            top: null,
            left: null,
            showList: false,
            textName: null,
            currentUser: 0,
            startPosition: null,
            users: []
        };
        this.toggleList = this.toggleList.bind(this);
        this.mentionText = this.mentionText.bind(this);
        this.keyDownPress = this.keyDownPress.bind(this);
        this.handleTextarea = this.handleTextarea.bind(this);

    }

    componentDidMount() {
        fetch('https://api.github.com/users?since=2018')
            .then(response => response.json())
            .then(data => this.setState({ users: data.map(user => user.login) }))
    }

    toggleList(value) {
        const { hookType, cursor } = value;

        if (hookType === 'start') {
            this.setState({
                showList: true,
                left: cursor.left,
                top: cursor.top + cursor.height,
                startPosition: cursor.selectionStart,

            });
        }

        if (hookType === 'cancel') {
            // reset the state

            this.setState({
                showList: false,
                left: null,
                top: null,
                startPosition: null,

            });
        }

    }

    mentionText(value) {
        this.setState({
            text: value.text,
        });
    }

    keyDownPress(event) {
        const { which } = event;
        const { currentUser, users } = this.state;

        if (which === 40 ) {
            event.preventDefault();

            this.setState({
                currentUser: (currentUser + 1) % users.length,
            });
        }

        if (which === 13) {
            event.preventDefault();

            const { users, currentUser, startPosition, textareaValue } = this.state;
            const user = users[currentUser];
            const newText = `${textareaValue.slice(0, startPosition - 1)}${user}${textareaValue.slice(startPosition + user.length, textareaValue.length)}`;

            this.setState({
                showList: false,
                left: null,
                top: null,
                text: null,
                startPosition: null,
                textareaValue: newText,
            });

            this.endHandler();
        }

    }

    handleTextarea(event) {
        const { value } = event.target;

        this.setState({
            textareaValue: value,
        })
    }

    render() {
        return (
            <div onKeyDown={this.keyDownPress} >
                <InputTrigger
                    trigger={{keyCode:50, shiftKey:true}}
                    onStart={ (data) => { this.toggleList(data); }}
                    onCancel={ (data) => { this.toggleList(data); }}
                    onType={ (data) => { this.mentionText(data); }}
                    endTrigger={(data) => { this.endHandler = data; }}
                >
                    <textarea style={{ height: '150px', width: '200px', lineHeight:'20px'}}
                              onChange={this.handleTextarea}
                              value={this.state.textareaValue}
                    />
                </InputTrigger>

                <div id="usersList"
                     style={{
                         position:'absolute',
                         background: 'blue',
                         width: '300px',
                         display: this.state.showList ? 'block' : 'none',
                         top: this.state.top,
                         left: this.state.left
                     }}>

                    {
                        this.state.users
                            .filter(user => user.indexOf(this.state.text) !== -1)
                            .map((user,index) => (
                                <div
                                    style={{
                                        padding: '10px',
                                        background: index === this.state.currentUser ? '#eee' : ''
                                    }}
                                >
                                    { user }
                                </div>
                            ))
                    }
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App/>,document.getElementById('app'))

module.hot.accept();
