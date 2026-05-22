import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { addMemberToTeam, createTeam, getTeamById, getTeams, removeMemberFromTeam } from '../../api/teamApi.js';
import { changeTaskStatus, createTask, deleteTask, getTasks, submitTaskForReview } from '../../api/taskApi.js';
import { getMyProfile, updateMyProfile } from '../../api/userApi.js';
import { clearAuthData } from '../../utils/auth.js';
import './Teams.scss';

const statusLabels = {
    planned: 'Запланирована',
    in_progress: 'В работе',
    on_review: 'К проверке',
    completed: 'Завершена',
};

const priorityLabels = {
    yes: 'Высокий',
    not: 'Обычный',
};

const initialTeamForm = {
    team_name: '',
    team_type: 'family',
};

const initialMemberForm = {
    email: '',
    role_in_team: 'member',
};

function getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setMinutes(0, 0, 0);
    return date.toISOString().slice(0, 16);
}

function Teams() {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [profileForm, setProfileForm] = useState({
        user_name: '',
        user_surname: '',
        phone_number: '',
        date_of_birth: '',
    });
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [teamForm, setTeamForm] = useState(initialTeamForm);
    const [memberForm, setMemberForm] = useState(initialMemberForm);
    const [taskForm, setTaskForm] = useState({
        name: '',
        user_id: '',
        deadline: getDefaultDeadline(),
        description: '',
        priority: 'not',
    });
    const [onlyMyTasks, setOnlyMyTasks] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const currentMembership = useMemo(() => {
        if (!selectedTeam || !currentUser) {
            return null;
        }

        return selectedTeam.members.find((member) => member.user.id === currentUser.id) || null;
    }, [selectedTeam, currentUser]);

    const isAdmin = currentMembership?.role_in_team === 'admin';

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            loadSelectedTeam(selectedTeamId);
        } else {
            setSelectedTeam(null);
            setTasks([]);
        }
    }, [selectedTeamId, onlyMyTasks, statusFilter]);

    async function loadInitialData() {
        setLoading(true);
        setError('');

        try {
            const [profile, teamList] = await Promise.all([getMyProfile(), getTeams()]);
            setCurrentUser(profile);
            setProfileForm({
                user_name: profile.user_name || '',
                user_surname: profile.user_surname || '',
                phone_number: profile.phone_number || '',
                date_of_birth: profile.date_of_birth || '',
            });
            setTeams(teamList);

            if (teamList.length > 0) {
                setSelectedTeamId(String(teamList[0].id));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadSelectedTeam(teamId) {
        setError('');

        try {
            const [teamDetails, taskList] = await Promise.all([
                getTeamById(teamId),
                getTasks(teamId, {
                    only_my: onlyMyTasks,
                    status: statusFilter || undefined,
                }),
            ]);

            setSelectedTeam(teamDetails);
            setTasks(taskList);

            if (!taskForm.user_id && teamDetails.members.length > 0) {
                setTaskForm((prev) => ({
                    ...prev,
                    user_id: String(teamDetails.members[0].user.id),
                }));
            }
        } catch (err) {
            setError(err.message);
        }
    }

    function updateForm(setter) {
        return (event) => {
            const { name, value } = event.target;
            setter((prev) => ({ ...prev, [name]: value }));
        };
    }

    async function handleCreateTeam(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const createdTeam = await createTeam(teamForm);
            setMessage('Семья создана');
            setTeamForm(initialTeamForm);
            const teamList = await getTeams();
            setTeams(teamList);
            setSelectedTeamId(String(createdTeam.id));
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleAddMember(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!selectedTeamId) {
            setError('Сначала выберите семью');
            return;
        }

        try {
            await addMemberToTeam(selectedTeamId, memberForm);
            setMessage('Участник добавлен');
            setMemberForm(initialMemberForm);
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleRemoveMember(userId) {
        setError('');
        setMessage('');

        try {
            await removeMemberFromTeam(selectedTeamId, userId);
            setMessage('Участник удалён');
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleCreateTask(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!selectedTeamId) {
            setError('Сначала выберите семью');
            return;
        }

        const payload = {
            name: taskForm.name,
            user_id: Number(taskForm.user_id),
            team_id: Number(selectedTeamId),
            deadline: taskForm.deadline,
            description: taskForm.description || null,
            priority: taskForm.priority,
        };

        try {
            await createTask(payload);
            setMessage('Задача создана');
            setTaskForm((prev) => ({
                ...prev,
                name: '',
                description: '',
                deadline: getDefaultDeadline(),
            }));
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSubmitForReview(taskId) {
        setError('');
        setMessage('');

        try {
            await submitTaskForReview(taskId);
            setMessage('Задача отправлена на проверку');
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleChangeStatus(taskId, status) {
        setError('');
        setMessage('');

        try {
            await changeTaskStatus(taskId, { status });
            setMessage('Статус задачи изменён');
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDeleteTask(taskId) {
        setError('');
        setMessage('');

        try {
            await deleteTask(taskId);
            setMessage('Задача удалена');
            await loadSelectedTeam(selectedTeamId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleUpdateProfile(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const updatedUser = await updateMyProfile({
                ...profileForm,
                phone_number: profileForm.phone_number || null,
                date_of_birth: profileForm.date_of_birth || null,
            });
            setCurrentUser(updatedUser);
            setMessage('Профиль обновлён');
        } catch (err) {
            setError(err.message);
        }
    }

    function handleLogout() {
        clearAuthData();
        navigate('/welcome');
    }

    if (loading) {
        return <div className="teams-page">Загрузка...</div>;
    }

    return (
        <main className="teams-page">
            <header className="teams-header">
                <div>
                    <p className="teams-header__eyebrow">Family ToDo List</p>
                    <h1>Семейные задачи</h1>
                    {currentUser && (
                        <p className="teams-header__user">
                            {currentUser.user_name} {currentUser.user_surname} · {currentUser.email}
                        </p>
                    )}
                </div>
                <Button type="button" variant="secondary" onClick={handleLogout}>
                    Выйти
                </Button>
            </header>

            {error && <div className="teams-message teams-message--error">{error}</div>}
            {message && <div className="teams-message teams-message--success">{message}</div>}

            <section className="teams-layout">
                <div className="teams-layout__left">
                    <Card>
                        <h2>Мои семьи</h2>
                        <form className="teams-form" onSubmit={handleCreateTeam}>
                            <Input
                                name="team_name"
                                placeholder="Название семьи"
                                value={teamForm.team_name}
                                onChange={updateForm(setTeamForm)}
                                required
                            />
                            <Input
                                name="team_type"
                                placeholder="Тип группы"
                                value={teamForm.team_type}
                                onChange={updateForm(setTeamForm)}
                                required
                            />
                            <Button type="submit" variant="primary" fullWidth>
                                Создать семью
                            </Button>
                        </form>

                        <div className="team-list">
                            {teams.length === 0 && <p className="empty">Пока нет созданных семей.</p>}
                            {teams.map((team) => (
                                <button
                                    key={team.id}
                                    className={`team-list__item ${String(team.id) === selectedTeamId ? 'team-list__item--active' : ''}`}
                                    type="button"
                                    onClick={() => setSelectedTeamId(String(team.id))}
                                >
                                    <span>{team.team_name}</span>
                                    <small>{team.team_type} · {team.num_of_users} участн.</small>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h2>Личный кабинет</h2>
                        <form className="teams-form" onSubmit={handleUpdateProfile}>
                            <Input
                                name="user_name"
                                placeholder="Имя"
                                value={profileForm.user_name}
                                onChange={updateForm(setProfileForm)}
                                required
                            />
                            <Input
                                name="user_surname"
                                placeholder="Фамилия"
                                value={profileForm.user_surname}
                                onChange={updateForm(setProfileForm)}
                                required
                            />
                            <Input
                                name="phone_number"
                                placeholder="Телефон"
                                value={profileForm.phone_number}
                                onChange={updateForm(setProfileForm)}
                            />
                            <Input
                                name="date_of_birth"
                                type="date"
                                value={profileForm.date_of_birth}
                                onChange={updateForm(setProfileForm)}
                            />
                            <Button type="submit" variant="secondary" fullWidth>
                                Сохранить профиль
                            </Button>
                        </form>
                    </Card>
                </div>

                <div className="teams-layout__right">
                    {selectedTeam ? (
                        <>
                            <Card>
                                <div className="section-header">
                                    <div>
                                        <h2>{selectedTeam.team_name}</h2>
                                        <p>
                                            Тип: {selectedTeam.team_type}. Ваша роль: {currentMembership?.role_in_team || 'member'}
                                        </p>
                                    </div>
                                    <select
                                        value={selectedTeamId}
                                        onChange={(event) => setSelectedTeamId(event.target.value)}
                                    >
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <h3>Участники</h3>
                                <div className="members">
                                    {selectedTeam.members.map((member) => (
                                        <div key={member.user.id} className="members__item">
                                            <div>
                                                <strong>{member.user.user_name} {member.user.user_surname}</strong>
                                                <small>{member.user.email} · {member.role_in_team}</small>
                                            </div>
                                            {isAdmin && member.user.id !== currentUser.id && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => handleRemoveMember(member.user.id)}
                                                >
                                                    Удалить
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {isAdmin && (
                                    <form className="teams-form teams-form--inline" onSubmit={handleAddMember}>
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="Email участника"
                                            value={memberForm.email}
                                            onChange={updateForm(setMemberForm)}
                                            required
                                        />
                                        <select
                                            name="role_in_team"
                                            value={memberForm.role_in_team}
                                            onChange={updateForm(setMemberForm)}
                                        >
                                            <option value="member">Пользователь</option>
                                            <option value="admin">Администратор</option>
                                        </select>
                                        <Button type="submit" variant="primary">
                                            Добавить
                                        </Button>
                                    </form>
                                )}
                            </Card>

                            {isAdmin && (
                                <Card>
                                    <h2>Создать задачу</h2>
                                    <form className="teams-form" onSubmit={handleCreateTask}>
                                        <Input
                                            name="name"
                                            placeholder="Название задачи"
                                            value={taskForm.name}
                                            onChange={updateForm(setTaskForm)}
                                            required
                                        />
                                        <textarea
                                            name="description"
                                            placeholder="Описание"
                                            value={taskForm.description}
                                            onChange={updateForm(setTaskForm)}
                                        />
                                        <div className="teams-form__grid">
                                            <select
                                                name="user_id"
                                                value={taskForm.user_id}
                                                onChange={updateForm(setTaskForm)}
                                                required
                                            >
                                                <option value="">Выберите исполнителя</option>
                                                {selectedTeam.members.map((member) => (
                                                    <option key={member.user.id} value={member.user.id}>
                                                        {member.user.user_name} {member.user.user_surname}
                                                    </option>
                                                ))}
                                            </select>
                                            <Input
                                                name="deadline"
                                                type="datetime-local"
                                                value={taskForm.deadline}
                                                onChange={updateForm(setTaskForm)}
                                                required
                                            />
                                            <select
                                                name="priority"
                                                value={taskForm.priority}
                                                onChange={updateForm(setTaskForm)}
                                            >
                                                <option value="not">Обычный приоритет</option>
                                                <option value="yes">Высокий приоритет</option>
                                            </select>
                                        </div>
                                        <Button type="submit" variant="primary" fullWidth>
                                            Создать задачу
                                        </Button>
                                    </form>
                                </Card>
                            )}

                            <Card>
                                <div className="section-header">
                                    <div>
                                        <h2>Задачи</h2>
                                        <p>Обычный пользователь может просматривать задачи и отправлять свои задачи на проверку.</p>
                                    </div>
                                    <div className="filters">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={onlyMyTasks}
                                                onChange={(event) => setOnlyMyTasks(event.target.checked)}
                                            />
                                            Только мои
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                        >
                                            <option value="">Все статусы</option>
                                            {Object.entries(statusLabels).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="tasks">
                                    {tasks.length === 0 && <p className="empty">Задач пока нет.</p>}
                                    {tasks.map((task) => (
                                        <article key={task.id} className="task-card">
                                            <div className="task-card__main">
                                                <h3>{task.name}</h3>
                                                <p>{task.description || 'Без описания'}</p>
                                                <small>
                                                    Дедлайн: {new Date(task.deadline).toLocaleString()} · Приоритет: {priorityLabels[task.priority] || task.priority}
                                                </small>
                                            </div>
                                            <div className="task-card__side">
                                                <span className="badge">{statusLabels[task.status] || task.status}</span>
                                                {isAdmin ? (
                                                    <>
                                                        <select
                                                            value={task.status}
                                                            onChange={(event) => handleChangeStatus(task.id, event.target.value)}
                                                        >
                                                            {Object.entries(statusLabels).map(([value, label]) => (
                                                                <option key={value} value={value}>{label}</option>
                                                            ))}
                                                        </select>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                            Удалить
                                                        </Button>
                                                    </>
                                                ) : (
                                                    task.user_id === currentUser?.id && task.status !== 'on_review' && task.status !== 'completed' && (
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            onClick={() => handleSubmitForReview(task.id)}
                                                        >
                                                            К проверке
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <h2>Выберите или создайте семью</h2>
                            <p className="empty">После создания семьи здесь появятся участники и задачи.</p>
                        </Card>
                    )}
                </div>
            </section>
        </main>
    );
}

export default Teams;
