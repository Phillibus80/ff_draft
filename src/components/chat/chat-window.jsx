const ChatWindow = ({messages = []}) =>
    <ul>
        {
            messages.length > 0
            && messages.map((message, index) =>
                <li key={`${message.MESSAGE}_${index}`}>
                    <sup>{message.USERNAME}</sup>
                    <p>&nbsp;&nbsp;{message.MESSAGE}</p>
                </li>
            )
        }
    </ul>;

export default ChatWindow;