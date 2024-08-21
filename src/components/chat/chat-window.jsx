const ChatWindow = ({messages = []}) =>
    <ul>
        {
            messages.length > 0
            && messages.map((message, index) =>
                <li key={`${message.content}_${index}`}>
                    {message.content}
                </li>)
        }
    </ul>;

export default ChatWindow;