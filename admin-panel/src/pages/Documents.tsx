import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Search, Upload, FolderOpen, MoreVertical, Download, Trash2, Eye } from 'lucide-react';
import { Input } from '../components/ui/input';

import api from '../lib/api';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'PDF': return <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">PDF</div>;
    case 'ZIP': return <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">ZIP</div>;
    case 'DOCX': return <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">DOCX</div>;
    default: return <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]"><FileText className="w-4 h-4"/></div>;
  }
}

export default function Documents() {
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/admin/documents');
        if (res.data.success) {
          setDocs(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching documents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredDocs = docs.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.owner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
            Document Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Securely store, organize, and retrieve legal documents.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Folders</h3>
            <ul className="space-y-1">
              <li className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-sm cursor-pointer flex justify-between items-center">
                All Documents
                <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-full">142</span>
              </li>
              <li className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer transition-colors flex justify-between items-center">
                Property Verification
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">45</span>
              </li>
              <li className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer transition-colors flex justify-between items-center">
                Corporate
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">38</span>
              </li>
              <li className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer transition-colors flex justify-between items-center">
                Family
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">21</span>
              </li>
              <li className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm cursor-pointer transition-colors flex justify-between items-center">
                Criminal
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">18</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Storage</h3>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 w-[45%]" />
            </div>
            <p className="text-xs text-slate-500 font-medium">45 GB used of 100 GB</p>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search files by name, type, or owner..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                    <th className="p-4">Name</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Folder</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Date</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No documents found.</td></tr>
                  ) : (
                    filteredDocs.map(doc => (
                      <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getIconForType(doc.fileType || 'DOC')}
                            <span className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer">{doc.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{doc.owner?.name || 'Unknown'}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 capitalize">{doc.category || 'General'}</Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{formatBytes(doc.sizeBytes)}</td>
                        <td className="p-4 text-sm text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 rounded-md shadow-sm transition-colors" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-md shadow-sm transition-colors" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-md shadow-sm transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
