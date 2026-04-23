import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { 
  Plus, Trash2, Save, RotateCcw, ListChecks, FlaskConical, 
  BookOpen, Search, Package, Edit, LayoutList 
} from 'lucide-react';

const Features = () => {
  const [products, setProducts] = useState([]);
  const [allFeaturesList, setAllFeaturesList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [features, setFeatures] = useState([""]);
  const [ingredients, setIngredients] = useState([""]);
  const [howToUse, setHowToUse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const prodRes = await instance.get("/api/products");
      setProducts(prodRes.data.data || prodRes.data);

      const featRes = await instance.get("/api/features/all/list");
      setAllFeaturesList(featRes.data.data || []);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  // Jab dropdown se product select karein
  useEffect(() => {
    if (selectedProductId) {
      fetchFeatureDetails(selectedProductId);
    } else {
      resetFields();
    }
  }, [selectedProductId]);

  const fetchFeatureDetails = async (id) => {
    try {
      const res = await instance.get(`/api/features/${id}`);
      if (res.data && res.data._id) {
        setFeatures(res.data.features.length ? res.data.features : [""]);
        setIngredients(res.data.ingredients.length ? res.data.ingredients : [""]);
        setHowToUse(res.data.howToUse || "");
      } else {
        resetFields();
      }
    } catch (err) {
      resetFields();
    }
  };

  const resetFields = () => {
    setFeatures([""]);
    setIngredients([""]);
    setHowToUse("");
  };

  const handleSave = async () => {
    if (!selectedProductId) return alert("Pehle product select karein!");
    setLoading(true);
    try {
      await instance.post("/api/features/save", {
        productId: selectedProductId,
        features: features.filter(f => f.trim() !== ""),
        ingredients: ingredients.filter(i => i.trim() !== ""),
        howToUse
      });
      alert("Specifications saved successfully! ✅");
      fetchInitialData(); // Table refresh karein
    } catch (err) {
      alert("Error saving data! ❌");
    } finally {
      setLoading(false);
    }
  };

  // Table functions (Delete)
  const handleDelete = async (id) => {
    if(window.confirm("Delete karein?")) {
        await instance.delete(`/api/features/${id}`);
        fetchInitialData();
    }
  }

  // Filter functionality
  const filteredSpecs = allFeaturesList.filter(item => 
    item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* --- TOP SECTION: FORM --- */}
      <div style={styles.card}>
        <div style={styles.header}>
          <LayoutList size={24} color="#4f46e5" />
          <h2 style={styles.title}>Manage Product Specifications</h2>
        </div>

        <div style={styles.dropdownSection}>
          <label style={styles.label}>Select Product:</label>
          <select style={styles.select} value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
            <option value="">-- Choose a Product --</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        {selectedProductId && (
          <>
            <div style={styles.section}>
              <div style={styles.sectionHeader}><ListChecks size={18} color="#4f46e5" /> <strong>Features</strong></div>
              {features.map((f, i) => (
                <div key={i} style={styles.row}>
                  <input style={styles.input} value={f} onChange={(e) => {
                    const newF = [...features]; newF[i] = e.target.value; setFeatures(newF);
                  }} />
                  <button onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} style={styles.delBtn}><Trash2 size={16}/></button>
                </div>
              ))}
              <button onClick={() => setFeatures([...features, ""])} style={styles.addBtn}>+ Add More</button>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}><FlaskConical size={18} color="#10b981" /> <strong>Ingredients</strong></div>
              {ingredients.map((ing, i) => (
                <div key={i} style={styles.row}>
                  <input style={styles.input} value={ing} onChange={(e) => {
                    const newI = [...ingredients]; newI[i] = e.target.value; setIngredients(newI);
                  }} />
                  <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} style={styles.delBtn}><Trash2 size={16}/></button>
                </div>
              ))}
              <button onClick={() => setIngredients([...ingredients, ""])} style={styles.addBtn}>+ Add More</button>
            </div>

            <textarea style={styles.textarea} value={howToUse} onChange={(e) => setHowToUse(e.target.value)} placeholder="How to use..." />
            <button onClick={handleSave} disabled={loading} style={styles.saveBtn}><Save size={18}/> {loading ? "Saving..." : "Save Specs"}</button>
          </>
        )}
      </div>

      {/* --- TABLE: productfeatures Collection Data --- */}
      <div style={{...styles.card, marginTop: '30px'}}>
        <div style={styles.tableHeader}>
          <h3><Package size={20} /> Specifications Inventory</h3>
          <input placeholder="Search product..." style={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Features (Array)</th>
              <th style={styles.th}>Ingredients (Array)</th>
              <th style={styles.th}>How to Use</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpecs.map(item => (
              <tr key={item._id} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{item.productId?.name}</strong><br/>
                  <small style={{color:'#94a3b8'}}>{item.productId?.sku}</small>
                </td>
                <td style={styles.td}>
                  {item.features.map((f, i) => <div key={i} style={styles.badge}>{f}</div>)}
                </td>
                <td style={styles.td}>
                  {item.ingredients.map((ing, i) => <div key={i} style={styles.badgeIng}>{ing}</div>)}
                </td>
                <td style={styles.td}><small>{item.howToUse}</small></td>
                <td style={styles.td}>
                  <button onClick={() => setSelectedProductId(item.productId?._id)} style={styles.editBtn}><Edit size={14} /></button>
                  <button onClick={() => handleDelete(item.productId?._id)} style={{...styles.editBtn, color: 'red'}}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', color: '#1e293b' },
  dropdownSection: { marginBottom: '25px', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' },
  select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' },
  section: { marginBottom: '20px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  row: { display: 'flex', gap: '10px', marginBottom: '8px' },
  input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  textarea: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' },
  delBtn: { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
  addBtn: { background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  saveBtn: { background: '#4f46e5', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '13px', verticalAlign: 'top' },
  badge: { display: 'inline-block', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', margin: '2px' },
  badgeIng: { display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', margin: '2px' },
  editBtn: { background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  searchInput: { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }
};

export default Features;