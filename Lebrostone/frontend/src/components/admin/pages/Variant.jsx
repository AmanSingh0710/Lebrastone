import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Edit2, Trash2, Plus, X, Package } from 'lucide-react';

const Variant = () => {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    productId: '', 
    weightOrSize: '', 
    price: '', 
    sku: '', 
    stock: '' 
  });

  useEffect(() => {
    fetchProducts();
    fetchVariants();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await instance.get("/api/products");
      if (res.data && res.data.data) setProducts(res.data.data);
    } catch (err) { console.error("Error loading products", err); }
  };

  const fetchVariants = async () => {
    try {
      const res = await instance.get("/api/variants/all-variants");
      setVariants(res.data);
    } catch (err) { console.error("Error loading variants", err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await instance.put(`/api/variants/update-variant/${currentId}`, formData);
      } else {
        await instance.post("/api/variants/add-variant", formData);
      }
      resetForm();
      fetchVariants();
    } catch (err) { alert("Error saving variant"); }
  };

  const resetForm = () => {
    setFormData({ productId: '', weightOrSize: '', price: '', sku: '', stock: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (v) => {
    setIsEditing(true);
    setCurrentId(v._id);
    setFormData({ 
      productId: v.productId?._id, 
      weightOrSize: v.weightOrSize, 
      price: v.price,
      sku: v.sku || '',
      stock: v.stock || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      await instance.delete(`/api/variants/delete-variant/${id}`);
      fetchVariants();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Package size={28} color="#4f46e5" />
        <h2 style={styles.title}>Product Variant Management</h2>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          {isEditing ? "Update Variant Details" : "Create New Variant"}
        </h3>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Product</label>
            <select 
              value={formData.productId} 
              onChange={(e) => setFormData({...formData, productId: e.target.value})} 
              required 
              style={styles.input}
            >
              <option value="">Select a product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>SKU Code</label>
            <input 
              type="text" placeholder="VAR-001" 
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Weight / Size</label>
            <input 
              type="text" placeholder="e.g. 500g, 1L" 
              value={formData.weightOrSize}
              onChange={(e) => setFormData({...formData, weightOrSize: e.target.value})}
              required style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price (₹)</label>
            <input 
              type="number" placeholder="0.00" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required style={styles.input}
            />
          </div>

          <div style={styles.buttonContainer}>
            <button type="submit" style={isEditing ? styles.updateBtn : styles.addBtn}>
              {isEditing ? <><Edit2 size={16} /> Update</> : <><Plus size={16} /> Add Variant</>}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                <X size={16} /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Size</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(v => (
              <tr key={v._id} style={styles.tr}>
                <td style={styles.td}><strong>{v.productId?.name || 'N/A'}</strong></td>
                <td style={styles.td}><span style={styles.skuBadge}>{v.sku || '---'}</span></td>
                <td style={styles.td}>{v.weightOrSize}</td>
                <td style={styles.td}>₹{v.price}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(v)} style={styles.actionEdit} title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(v._id)} style={styles.actionDelete} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Inline Styles for a Modern UI
const styles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' },
  title: { fontSize: '24px', color: '#1e293b', margin: 0 },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '40px' },
  cardTitle: { marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#334155' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#64748b' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' },
  buttonContainer: { display: 'flex', gap: '10px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  updateBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '16px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' },
  skuBadge: { backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#64748b', border: '1px solid #e2e8f0' },
  actionEdit: { border: 'none', background: 'none', color: '#6366f1', cursor: 'pointer', marginRight: '10px', transition: '0.2s' },
  actionDelete: { border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', transition: '0.2s' }
};

export default Variant;