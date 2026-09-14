const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'Withdrawals.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Download icon import
content = content.replace("Eye, Download, ChevronLeft, ChevronRight", "Eye, Download, ChevronLeft, ChevronRight, Filter, Download as DownloadIcon");
content = content.replace("import {\n  Wallet, Clock, CheckCircle, XCircle, Search,\n  RefreshCw, IndianRupee, TrendingUp, AlertCircle, Copy, Check\n} from 'lucide-react';", 
"import {\n  Wallet, Clock, CheckCircle, XCircle, Search,\n  RefreshCw, IndianRupee, TrendingUp, AlertCircle, Copy, Check, Download as DownloadIcon, Filter\n} from 'lucide-react';");

// 2. Add state
const stateInsert = `  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
`;
content = content.replace("const [copied, setCopied] = useState<string | null>(null);", "const [copied, setCopied] = useState<string | null>(null);\n" + stateInsert);

// 3. Add derived state and export handler
const derivedStateAndExport = `  const filteredWithdrawals = withdrawals.filter(w => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        w.advocateUser?.name?.toLowerCase().includes(q) ||
        w.advocateUser?.email?.toLowerCase().includes(q) ||
        w.transactionId?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (dateRange !== 'all') {
      const wDate = new Date(w.createdAt);
      const now = new Date();
      if (dateRange === 'today' && wDate.toDateString() !== now.toDateString()) return false;
      if (dateRange === '7days' && (now.getTime() - wDate.getTime()) > 7 * 24 * 60 * 60 * 1000) return false;
      if (dateRange === '30days' && (now.getTime() - wDate.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (filteredWithdrawals.length === 0) return alert('No data to export');
    const headers = ['Advocate Name', 'Email', 'Amount', 'Status', 'Requested At', 'Bank Name', 'Account Number', 'IFSC', 'UPI ID', 'Transaction ID'];
    const rows = filteredWithdrawals.map(w => [
      \`"\${w.advocateUser?.name || 'N/A'}"\`,
      w.advocateUser?.email || 'N/A',
      w.amount,
      w.status,
      new Date(w.createdAt).toLocaleDateString('en-IN'),
      \`"\${w.bankDetails?.bankName || 'N/A'}"\`,
      \`"'\${w.bankDetails?.accountNumber || ''}"\`,
      w.bankDetails?.ifscCode || 'N/A',
      w.bankDetails?.upiId || 'N/A',
      w.transactionId || 'N/A'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`Withdrawals_Export_\${new Date().toLocaleDateString('en-IN')}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;
content = content.replace("const copyText = (text: string, key: string) => {", derivedStateAndExport + "\n  const copyText = (text: string, key: string) => {");

// 4. Change map over withdrawals to filteredWithdrawals
content = content.replace(" withdrawAmount => ", " filteredWithdrawals => ");
// Let's do it safely
content = content.replace(" withdrawals.filter(w => new Date(w.createdAt)", " withdrawals.filter(w => new Date(w.createdAt)"); // skip stats
content = content.replace(" withdrawals.length === 0 ?", " filteredWithdrawals.length === 0 ?");
content = content.replace(" withdrawals.map(w => {", " filteredWithdrawals.map(w => {");

// 5. Add search and filter and export UI right before the table
const filterUI = `
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by advocate, email, or TXN ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
            <DownloadIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>
`;

content = content.replace("</div>\n\n        <div className=\"overflow-x-auto\">", "</div>\n" + filterUI + "\n        <div className=\"overflow-x-auto\">");

fs.writeFileSync(file, content);
console.log('Patched Withdrawals.tsx');
