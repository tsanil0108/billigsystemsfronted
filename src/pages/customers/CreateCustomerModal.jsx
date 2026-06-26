import React, { useState } from 'react';
import { customerService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import './CreateCustomerModal.css';

export default function CreateCustomerModal({ isOpen, onClose, onSuccess, editData }) {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: editData?.name || '',
    email: editData?.email || '',
    phone: editData?.phone || '',
    gstNumber: editData?.gstNumber || '',
    address: editData?.address || '',
    city: editData?.city || '',
    state: editData?.state || '',
    pincode: editData?.pincode || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await customerService.update(editData.id, form);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(form);
        toast.success('Customer created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Customer' : 'Add New Customer'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Customer name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="customer@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              className="form-input"
              placeholder="27ABCDE1234F1Z5"
              value={form.gstNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className="form-input"
            placeholder="Street address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              className="form-input"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              name="state"
              className="form-input"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              className="form-input"
              placeholder="110001"
              value={form.pincode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}