import './Input.scss'

function Input({
    type = 'text',
    placeholder = '',
    className = '',
    ...props
}) {
    const classes = [
        'input',
        className,
    ].filter(Boolean).join(' ');
    return (
        <input
            type={type}
            placeholder={placeholder}
            className={classes}
            {...props}
        />
    );
}

export default Input;