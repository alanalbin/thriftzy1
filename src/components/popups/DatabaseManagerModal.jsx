import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Trash2, RefreshCw, Plus, CheckCircle, Tag, Phone, Download, Upload, AlertCircle } from 'lucide-react';
import { exportDatabaseJSON, importDatabaseJSON } from '../../services/api';

export default function DatabaseManagerModal({
  isOpen,
  onClose,
  items,
  dbStats,
  onDeleteItem,
  onOpenAddModal,
  onDatabaseReload
}) {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'backup'
  const fileImportRef = useRef(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDatabaseJSON();
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const imported = importDatabaseJSON(json);
        onDatabaseReload?.(imported);
        alert(`Successfully imported ${imported.length} clothes into your database!`);
      } catch (err) {
        alert('Failed to parse JSON backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div
        style={{ perspective: '1400px' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
        />

        {/* 3D Folding Pop-in Modal */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: 20,
            rotateY: 6,
            scale: 0.9,
            z: -120,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            z: 0,
          }}
          exit={{
            opacity: 0,
            rotateX: -16,
            scale: 0.92,
            z: -80,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 280,
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-red-500/20 z-10 flex flex-col outcrowd-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                  <span>Store Database Studio</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-300">
                    Vercel & SQLite Ready
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage inventory, export backups, and sync across devices.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Database Metrics Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Clothes in DB</span>
              <span className="text-xl font-black text-neutral-900">{items.length} Items</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Valuation</span>
              <span className="text-xl font-black text-red-600">
                ${items.reduce((acc, it) => acc + (Number(it.price) || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Storage Layer</span>
              <span className="text-xs font-bold text-neutral-800">Hybrid SQLite + Local</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Vercel Status</span>
              <span className="text-xs font-bold text-emerald-600">100% Persistent</span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'items'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Inventory Table ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'backup'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Backup & Restore (JSON)
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ List New Cloth</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1">
            {activeTab === 'items' && (
              items.length === 0 ? (
                <div className="text-center py-14 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                  <Tag className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                  <h4 className="font-bold text-neutral-800 text-sm">No Clothes Listed Yet</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Your database is clean. Click "+ List New Cloth" to add your first piece!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-red-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200 bg-white"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900">{item.name}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              {item.category}
                            </span>
                            <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold">
                              Size {item.size}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                            ID: {item.id} • {item.condition} {item.contactNumber ? `• WhatsApp: ${item.contactNumber}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-black text-neutral-900">
                          ${item.price}
                        </span>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete cloth from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'backup' && (
              <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">1-Click Database Portability</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Download your clothes database as a JSON backup or import it onto another computer or Vercel instance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase">
                      <Download className="w-4 h-4" />
                      <span>Export Backup</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Download all {items.length} listed clothes and photos to your local computer.
                    </p>
                    <button
                      onClick={handleExport}
                      className="w-full py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      Download JSON Backup
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                      <Upload className="w-4 h-4" />
                      <span>Import / Restore</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Upload a previously exported JSON backup to instantly restore your store.
                    </p>
                    <input
                      ref={fileImportRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileImportRef.current?.click()}
                      className="w-full py-2.5 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      Select JSON File to Restore
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
