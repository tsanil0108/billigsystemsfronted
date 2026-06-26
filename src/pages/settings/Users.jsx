import React, { useState, useEffect } from 'react';
import { userService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'STAFF',
    password: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await userService.update(editingUser.id, form);
        toast.success('User updated successfully');
      } else {
        await userService.create(form);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditingUser(null);
      setForm({ fullName: '', email: '', phone: '', role: 'STAFF', password: '' });
      loadUsers();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, active) => {
    try {
      if (active) {
        await userService.deactivate(id);
        toast.success('User deactivated');
      } else {
        await userService.activate(id);
        toast.success('User activated');
      }
      loadUsers();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => <Badge color={row.role === 'ADMIN' ? 'primary' : 'gray'}>{row.role}</Badge>
    },
    { 
      key: 'active', 
      label: 'Status',
      render: (row) => (
        <Badge color={row.active ? 'success' : 'danger'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="actions">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => {
              setEditingUser(row);
              setForm({
                fullName: row.fullName,
                email: row.email,
                phone: row.phone || '',
                role: row.role,
                password: '',
              });
              setShowModal(true);
            }}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant={row.active ? 'danger' : 'success'}
            onClick={() => handleToggleStatus(row.id, row.active)}
          >
            {row.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <Card 
        title="Users" 
        headerActions={
          <Button variant="primary" size="sm" onClick={() => {
            setEditingUser(null);
            setForm({ fullName: '', email: '', phone: '', role: 'STAFF', password: '' });
            setShowModal(true);
          }}>
            + Add User
          </Button>
        }
      >
        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role <span className="required">*</span></label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
          </div>
          {!editingUser && (
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required={!editingUser}
              />
            </div>
          )}
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}