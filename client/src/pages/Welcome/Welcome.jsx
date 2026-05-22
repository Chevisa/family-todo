import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { loginUser, registerUser } from '../../api/authApi.js';
import { saveAuthData } from '../../utils/auth.js';
import './Welcome.scss';

const initialLoginForm = {
    email: '',
    password: '',
};

const initialRegisterForm = {
    user_name: '',
    user_surname: '',
    email: '',
    password: '',
    phone_number: '',
    date_of_birth: '',
};

function Welcome() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [loginForm, setLoginForm] = useState(initialLoginForm);
    const [registerForm, setRegisterForm] = useState(initialRegisterForm);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const isLogin = mode === 'login';

    function updateLoginField(event) {
        const { name, value } = event.target;
        setLoginForm((prev) => ({ ...prev, [name]: value }));
    }

    function updateRegisterField(event) {
        const { name, value } = event.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleLogin(event) {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await loginUser(loginForm);
            saveAuthData(response);
            navigate('/teams');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const payload = {
            ...registerForm,
            phone_number: registerForm.phone_number || null,
            date_of_birth: registerForm.date_of_birth || null,
        };

        try {
            const response = await registerUser(payload);
            saveAuthData(response);
            navigate('/teams');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleYandexLogin() {
        setError('Вход через Яндекс.ID пока не подключён на backend. Сейчас работает вход по email и паролю.');
    }

    return (
        <main className="welcome-page">
            <Card className="welcome">
                <div className="welcome__intro">
                    <h1>Добро пожаловать в HouseFlow</h1>
                    <p>
                        Сервис для семейного планирования задач. Создавайте группы,
                        добавляйте участников, распределяйте обязанности и отслеживайте
                        выполнение через общий список дел.
                    </p>
                </div>

                <div className="welcome__tabs">
                    <Button
                        type="button"
                        variant={isLogin ? 'primary' : 'secondary'}
                        fullWidth
                        onClick={() => setMode('login')}
                    >
                        Авторизация
                    </Button>
                    <Button
                        type="button"
                        variant={!isLogin ? 'primary' : 'secondary'}
                        fullWidth
                        onClick={() => setMode('register')}
                    >
                        Регистрация
                    </Button>
                </div>

                {isLogin ? (
                    <form className="welcome__form" onSubmit={handleLogin}>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={loginForm.email}
                            onChange={updateLoginField}
                            required
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Пароль"
                            value={loginForm.password}
                            onChange={updateLoginField}
                            minLength={8}
                            required
                        />
                        <Button type="submit" variant="primary" fullWidth disabled={loading}>
                            {loading ? 'Входим...' : 'Войти'}
                        </Button>
                    </form>
                ) : (
                    <form className="welcome__form" onSubmit={handleRegister}>
                        <div className="welcome__grid">
                            <Input
                                name="user_name"
                                placeholder="Имя"
                                value={registerForm.user_name}
                                onChange={updateRegisterField}
                                required
                            />
                            <Input
                                name="user_surname"
                                placeholder="Фамилия"
                                value={registerForm.user_surname}
                                onChange={updateRegisterField}
                                required
                            />
                        </div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={registerForm.email}
                            onChange={updateRegisterField}
                            required
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Пароль от 8 символов"
                            value={registerForm.password}
                            onChange={updateRegisterField}
                            minLength={8}
                            maxLength={72}
                            required
                        />
                        <div className="welcome__grid">
                            <Input
                                name="phone_number"
                                placeholder="Телефон, необязательно"
                                value={registerForm.phone_number}
                                onChange={updateRegisterField}
                            />
                            <Input
                                name="date_of_birth"
                                type="date"
                                value={registerForm.date_of_birth}
                                onChange={updateRegisterField}
                            />
                        </div>
                        <Button type="submit" variant="primary" fullWidth disabled={loading}>
                            {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                        </Button>
                    </form>
                )}

                <Button type="button" variant="secondary" fullWidth onClick={handleYandexLogin}>
                    Войти по Яндекс.ID
                </Button>

                {error && <p className="welcome__message welcome__message--error">{error}</p>}
                {success && <p className="welcome__message welcome__message--success">{success}</p>}

                <Link className="welcome__link" to="/teams">
                    Перейти к командам
                </Link>
            </Card>
        </main>
    );
}

export default Welcome;
