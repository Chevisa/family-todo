import './Button.scss'

function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) {
    const classes = [
        'button',
        `button--${variant}`,
        fullWidth ? 'button--full-width' : '',
        className,
    ].filter(Boolean).join(' ');  // фильтруем пустые строки

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}

export default Button;