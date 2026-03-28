'use client';

import { useState, useEffect } from 'react';

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
  created_at: string;
};

type ModalType = 'create' | 'edit' | 'password' | null;

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState('admin');
  const [formPassword, setFormPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar usuários.' });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormName('');
    setFormUsername('');
    setFormRole('admin');
    setFormPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditingUser(null);
    setModalType(null);
  }

  function openCreate() {
    resetForm();
    setModalType('create');
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormRole(user.role);
    setFormPassword('');
    setModalType('edit');
  }

  function openPasswordChange(user: User) {
    setEditingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setModalType('password');
  }

  async function handleCreate() {
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          username: formUsername.trim(),
          role: formRole,
          password: formPassword,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
        resetForm();
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao criar usuário.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editingUser || !formName.trim() || !formUsername.trim()) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {
        name: formName.trim(),
        username: formUsername.trim(),
        role: formRole,
      };
      if (formPassword.trim()) {
        body.password = formPassword.trim();
      }
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
        resetForm();
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar usuário.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (!editingUser) return;
    if (!newPassword.trim()) {
      setMessage({ type: 'error', text: 'Digite a nova senha.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        resetForm();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao alterar senha.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao excluir usuário.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Novo Usuário
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Users list */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Carregando...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl bg-gray-800/50 p-8 text-center ring-1 ring-gray-700">
          <p className="text-gray-400">Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl bg-gray-800/50 p-4 ring-1 ring-gray-700">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                  <span className="inline-block rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                    {user.role}
                  </span>
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  Criado em {formatDate(user.created_at)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEdit(user)}
                    className="rounded px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openPasswordChange(user)}
                    className="rounded px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    Alterar Senha
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="rounded px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto rounded-xl ring-1 ring-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800 text-left text-gray-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Perfil</th>
                  <th className="px-4 py-3">Criado em</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-700/50 ${
                      idx % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/20'
                    }`}
                  >
                    <td className="px-4 py-3 text-white">{user.name}</td>
                    <td className="px-4 py-3 text-gray-300">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openPasswordChange(user)}
                          className="rounded px-3 py-1 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                        >
                          Alterar Senha
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="rounded px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="fixed inset-0 flex flex-col bg-gray-800 p-6 overflow-y-auto sm:static sm:inset-auto sm:mx-4 sm:w-full sm:max-w-md sm:rounded-xl sm:ring-1 sm:ring-gray-700">
            {/* Create / Edit modal */}
            {(modalType === 'create' || modalType === 'edit') && (
              <>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  {modalType === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Nome</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Usuário</label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="Nome de usuário"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Perfil</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Gerente</option>
                      <option value="staff">Funcionário</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">
                      {modalType === 'create' ? 'Senha' : 'Senha (deixe vazio para manter)'}
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={
                        modalType === 'create' ? 'Digite a senha' : 'Nova senha (opcional)'
                      }
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={modalType === 'create' ? handleCreate : handleEdit}
                    disabled={saving}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </>
            )}

            {/* Password change modal */}
            {modalType === 'password' && editingUser && (
              <>
                <h2 className="mb-1 text-lg font-semibold text-white">Alterar Senha</h2>
                <p className="mb-4 text-sm text-gray-400">
                  Usuário: <span className="text-gray-300">{editingUser.name}</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={resetForm}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Alterar Senha'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
