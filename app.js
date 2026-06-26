const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'deliveries.json');

// Ensure database file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Embedded Web Interface Frontend
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Direct Chemist Outlet Warralily - Network Sync Tracker</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#0053A0">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
        body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            -webkit-tap-highlight-color: transparent;
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen pb-12">

    <header class="bg-[#0053A0] text-white shadow-md border-t-8 border-[#FFE600] mb-8">
        <div class="max-w-7xl mx-auto px-6 py-6">
            <h1 class="text-2xl md:text-3xl font-black tracking-tight uppercase text-white">
                DIRECT CHEMIST OUTLET WARRALILY
            </h1>
            <p class="text-xs font-bold text-[#FFE600] tracking-wider uppercase mt-1">
                Discount Chemist • Live Network Delivery Hub
            </p>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0053A0] h-fit sticky top-4">
            <h2 id="formTitle" class="text-xl font-black text-[#0053A0] mb-4 border-b border-slate-200 pb-2 uppercase tracking-wide">Record New Delivery</h2>
            <form id="deliveryForm" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Patient / Customer Name</label>
                    <input type="text" id="customerName" required class="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Date Logged</label>
                    <input type="date" id="deliveryDate" required class="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                    <input type="tel" id="phone" required class="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium" placeholder="e.g., 0400 000 000">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Delivery Address</label>
                    <textarea id="address" required rows="2" class="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium" placeholder="Street Name, Suburb"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Medication / Products</label>
                    <input type="text" id="products" required class="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium" placeholder="e.g., Atorvastatin 20mg">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Payment Status</label>
                        <select id="paymentStatus" class="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium">
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Cash on Delivery">Cash on Delivery</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Delivery Type</label>
                        <select id="deliveryType" class="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-medium">
                            <option value="One-time">One-time</option>
                            <option value="Recurring">Regular (Recurring)</option>
                        </select>
                    </div>
                </div>
                <div id="frequencyWrapper" class="bg-[#FFE600]/10 p-3 rounded-lg border border-[#FFE600]/40">
                    <label class="block text-xs font-bold uppercase text-[#0053A0] mb-1">Recurring Interval (Days)</label>
                    <input type="number" id="frequencyDays" value="30" min="1" class="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0053A0] focus:outline-none font-bold text-[#0053A0]">
                </div>
                <div class="flex gap-2 pt-2">
                    <button type="button" id="cancelEditBtn" onclick="resetForm()" class="hidden w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition duration-200 uppercase text-xs">Cancel</button>
                    <button type="submit" id="submitBtn" class="flex-1 bg-[#E31B23] hover:bg-[#c2131a] text-white font-black py-2.5 px-4 rounded-lg transition duration-200 shadow-md uppercase tracking-wide">Log Delivery</button>
                </div>
            </form>
        </div>

        <div class="lg:col-span-2 space-y-8">
            <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#FFE600]">
                <h2 class="text-xl font-black mb-4 text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <span class="text-[#E31B23]">⏰</span> Regular Deliveries Due Soon
                </h2>
                <div id="remindersContainer" class="space-y-3"></div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#0053A0]">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-200 pb-3">
                    <h2 class="text-xl font-black text-slate-800 uppercase tracking-wide">All Outlet Logs</h2>
                    <div class="flex flex-wrap items-center gap-2">
                        <label class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold transition shadow-sm flex items-center gap-1 uppercase tracking-wider cursor-pointer">
                            📤 Import CSV <input type="file" id="importFileInput" accept=".csv" onchange="importFromCSV(this)" class="hidden">
                        </label>
                        <button onclick="exportToCSV()" class="text-xs bg-[#0053A0] hover:bg-[#003f7a] text-white px-3 py-2 rounded-lg font-bold transition shadow-sm flex items-center gap-1 uppercase tracking-wider">📥 Download CSV</button>
                        <button onclick="clearAllData()" class="text-xs font-bold text-red-600 hover:underline uppercase pl-1">Clear All</button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-400 text-xs uppercase font-black tracking-wider">
                                <th class="pb-3">Date</th>
                                <th class="pb-3">Customer Profile</th>
                                <th class="pb-3">Address</th>
                                <th class="pb-3">Medication</th>
                                <th class="pb-3">Classification</th>
                                <th class="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="logTableBody" class="divide-y divide-slate-100 text-sm"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        let currentEditingId = null;

        window.addEventListener('DOMContentLoaded', () => {
            setDefaultDate();
            loadData();
            setInterval(loadData, 10000); // Quick poll sync every 10 seconds across network terminals
        });

        async function getDeliveriesFromServer() {
            try {
                const response = await fetch('/api/deliveries');
                return await response.json();
            } catch (err) {
                return [];
            }
        }

        async function saveDeliveriesToServer(dataArray) {
            try {
                await fetch('/api/deliveries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataArray)
                });
                await loadData();
            } catch (err) {
                alert("Pipeline Connection Lost: Server changes could not write.");
            }
        }

        function getLocalTodayString() {
            const today = new Date();
            return \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\\${String(today.getDate()).padStart(2, '0')}\`;
        }

        function setDefaultDate() {
            document.getElementById('deliveryDate').value = getLocalTodayString();
        }

        function parseLocalDate(dateStr) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }

        document.getElementById('deliveryForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            let deliveries = await getDeliveriesFromServer();

            const deliveryData = {
                customerName: document.getElementById('customerName').value,
                date: document.getElementById('deliveryDate').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                products: document.getElementById('products').value,
                paymentStatus: document.getElementById('paymentStatus').value,
                type: document.getElementById('deliveryType').value,
                frequency: parseInt(document.getElementById('frequencyDays').value) || 30
            };

            if (currentEditingId) {
                deliveries = deliveries.map(item => item.id === currentEditingId ? { ...item, ...deliveryData } : item);
            } else {
                deliveryData.id = Date.now();
                deliveries.push(deliveryData);
            }

            resetForm();
            await saveDeliveriesToServer(deliveries);
        });

        async function completeReminder(id) {
            let deliveries = await getDeliveriesFromServer();
            const item = deliveries.find(d => d.id === id);
            if (!item) return;

            if (confirm(\`Mark delivery complete for \${item.customerName}? This rolls their schedule forward.\`)) {
                deliveries.push({
                    id: Date.now(),
                    customerName: item.customerName,
                    date: getLocalTodayString(),
                    phone: item.phone,
                    address: item.address,
                    products: item.products,
                    paymentStatus: item.paymentStatus, 
                    type: item.type,
                    frequency: item.frequency
                });
                await saveDeliveriesToServer(deliveries);
            }
        }

        async function editDelivery(id) {
            const deliveries = await getDeliveriesFromServer();
            const item = deliveries.find(d => d.id === id);
            if (!item) return;

            currentEditingId = id;
            document.getElementById('customerName').value = item.customerName;
            document.getElementById('deliveryDate').value = item.date;
            document.getElementById('phone').value = item.phone;
            document.getElementById('address').value = item.address;
            document.getElementById('products').value = item.products;
            document.getElementById('paymentStatus').value = item.paymentStatus;
            document.getElementById('deliveryType').value = item.type;
            document.getElementById('frequencyDays').value = item.frequency || 30;

            document.getElementById('formTitle').innerText = "✏️ Edit Record Mode";
            document.getElementById('submitBtn').innerText = "Update Entry";
            document.getElementById('cancelEditBtn').classList.remove('hidden');
            document.getElementById('deliveryForm').scrollIntoView({ behavior: 'smooth' });
        }

        async function deleteDelivery(id) {
            if (confirm("Delete this delivery entry log permanently?")) {
                let deliveries = await getDeliveriesFromServer();
                deliveries = deliveries.filter(d => d.id !== id);
                if (currentEditingId === id) resetForm();
                await saveDeliveriesToServer(deliveries);
            }
        }

        function resetForm() {
            currentEditingId = null;
            document.getElementById('deliveryForm').reset();
            document.getElementById('frequencyDays').value = 30;
            setDefaultDate();
            document.getElementById('formTitle').innerText = "Record New Delivery";
            document.getElementById('submitBtn').innerText = "Log Delivery";
            document.getElementById('cancelEditBtn').classList.add('hidden');
        }

        async function loadData() {
            const deliveries = await getDeliveriesFromServer();
            const logTableBody = document.getElementById('logTableBody');
            const remindersContainer = document.getElementById('remindersContainer');
            
            logTableBody.innerHTML = '';
            remindersContainer.innerHTML = '';

            const sortedDeliveries = [...deliveries].sort((a,b) => parseLocalDate(b.date) - parseLocalDate(a.date));
            if(sortedDeliveries.length === 0) {
                logTableBody.innerHTML = \`<tr><td colspan="6" class="text-center py-8 text-slate-400 font-medium">No shared pharmacy records found.</td></tr>\`;
            }

            sortedDeliveries.forEach(item => {
                const payColor = item.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-[#E31B23]/10 text-[#E31B23]';
                const typeColor = item.type === 'Recurring' ? 'bg-[#0053A0]/10 text-[#0053A0] border border-[#0053A0]/20' : 'bg-slate-100 text-slate-600';
                const repeatText = item.type === 'Recurring' ? \`<br><span class="text-[10px] text-[#0053A0] font-bold">🔁 Interval: \${item.frequency || 30} Days</span>\` : '';
                
                logTableBody.innerHTML += \`
                    <tr class="hover:bg-slate-50 transition duration-100">
                        <td class="py-3 font-bold text-slate-600">\${item.date}</td>
                        <td class="py-3 font-bold text-slate-800">\${item.customerName}<br><span class="text-xs text-slate-400 font-normal">\${item.phone}</span></td>
                        <td class="py-3 text-slate-500 max-w-xs truncate" title="\${item.address}">\${item.address}</td>
                        <td class="py-3 text-[#0053A0] font-bold">\${item.products}</td>
                        <td class="py-3 space-y-1">
                            <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold \${payColor}">\${item.paymentStatus}</span><br>
                            <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold \${typeColor}">\${item.type}</span>
                            \${repeatText}
                        </td>
                        <td class="py-3 text-right space-x-2 whitespace-nowrap">
                            <button onclick="editDelivery(\${item.id})" class="text-xs font-bold text-[#0053A0] hover:underline">Edit</button>
                            <button onclick="deleteDelivery(\${item.id})" class="text-xs font-bold text-red-600 hover:underline">Delete</button>
                        </td>
                    </tr>
                \`;
            });

            const recurringItems = deliveries.filter(d => d.type === 'Recurring');
            const latestRecurringMap = {};

            recurringItems.forEach(item => {
                const key = item.customerName.toLowerCase().trim();
                const currentDateTime = parseLocalDate(item.date);
                if (!latestRecurringMap[key] || currentDateTime > parseLocalDate(latestRecurringMap[key].date)) {
                    latestRecurringMap[key] = item;
                }
            });

            const reminders = [];
            const today = parseLocalDate(getLocalTodayString());

            Object.values(latestRecurringMap).forEach(item => {
                const lastDate = parseLocalDate(item.date);
                const daysInterval = item.frequency || 30;
                const dueDate = new Date(lastDate);
                dueDate.setDate(lastDate.getDate() + daysInterval);
                dueDate.setHours(0,0,0,0);

                const timeDiff = dueDate.getTime() - today.getTime();
                const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                reminders.push({ ...item, dueDate: dueDate.toISOString().split('T')[0], daysRemaining });
            });

            reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);

            if(reminders.length === 0) {
                remindersContainer.innerHTML = \`<p class="text-sm text-slate-400 text-center py-4 font-medium">No recurring patient schedules tracked.</p>\`;
            }

            reminders.forEach(reminder => {
                let cardStyle = "", badgeMarkup = "";
                
                if (reminder.daysRemaining < 0) {
                    cardStyle = 'bg-rose-50 border-l-4 border-l-[#E31B23] border-slate-200 text-rose-900';
                    badgeMarkup = \`<span class="inline-block text-xs font-black px-2.5 py-1 rounded bg-[#E31B23] text-white shadow-sm uppercase">⚠️ OVERDUE BY \${Math.abs(reminder.daysRemaining)} DAYS</span>\`;
                } else if (reminder.daysRemaining === 0) {
                    cardStyle = 'bg-amber-50 border-l-4 border-l-[#FFE600] border-slate-200 text-amber-900';
                    badgeMarkup = \`<span class="inline-block text-xs font-black px-2.5 py-1 rounded bg-[#FFE600] text-[#0053A0] shadow-sm uppercase">🚨 DUE TODAY</span>\`;
                } else if (reminder.daysRemaining <= 3) {
                    cardStyle = 'bg-amber-50/60 border-l-4 border-l-amber-400 border-slate-200 text-amber-800';
                    badgeMarkup = \`<span class="inline-block text-xs font-bold px-2.5 py-1 rounded bg-amber-400 text-slate-900 uppercase">Due in \${reminder.daysRemaining} days</span>\`;
                } else {
                    cardStyle = 'bg-slate-50 border-l-4 border-l-[#0053A0] border-slate-200 text-slate-700';
                    badgeMarkup = \`<span class="inline-block text-xs font-bold px-2.5 py-1 rounded bg-[#0053A0]/10 text-[#0053A0] uppercase">In \${reminder.daysRemaining} days</span>\`;
                }

                remindersContainer.innerHTML += \`
                    <div class="p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center transition duration-150 border \${cardStyle}">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h4 class="font-black text-slate-800 text-base">\${reminder.customerName}</h4>
                                <span class="text-xs font-bold text-slate-500">(\${reminder.phone})</span>
                                <button onclick="editDelivery(\${reminder.id})" class="text-slate-400 hover:text-[#0053A0] text-sm ml-1">✏️</button>
                            </div>
                            <p class="text-xs mt-1 text-slate-600"><strong>Items:</strong> \${reminder.products} | <strong>Route:</strong> \${reminder.address}</p>
                            <p class="text-xs text-slate-400 mt-0.5 font-medium">Last supplied: \${reminder.date} (Interval: \${reminder.frequency || 30} days)</p>
                        </div>
                        <div class="mt-3 md:mt-0 text-left md:text-right min-w-[170px] flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto">
                            \${badgeMarkup}
                            <p class="text-xs font-bold text-slate-500">Target Date: \${reminder.dueDate}</p>
                            <button onclick="completeReminder(\${reminder.id})" class="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] px-3 py-1.5 rounded shadow-sm uppercase tracking-wider transition duration-150 w-full md:w-auto text-center">✅ Mark Done</button>
                        </div>
                    </div>
                \`;
            });
        }

        async function exportToCSV() {
            const deliveries = await getDeliveriesFromServer();
            if (deliveries.length === 0) return alert("No records to export!");
            const headers = ["Date", "Customer Name", "Phone", "Address", "Products/Medication", "Payment Status", "Delivery Type", "Schedule Frequency (Days)"];
            const csvRows = [headers.join(",")];
            deliveries.forEach(item => {
                csvRows.push([\`"\${item.date}"\`, \`"\${item.customerName.replace(/"/g, '""')}"\`, \`"\${item.phone.replace(/"/g, '""')}"\`, \`"\${item.address.replace(/"/g, '""')}"\`, \`"\${item.products.replace(/"/g, '""')}"\`, \`"\${item.paymentStatus}"\`, \`"\${item.type}"\`, \`"\${item.frequency || 30}"\`].join(","));
            });
            const link = document.createElement("a");
            link.setAttribute("href", URL.createObjectURL(new Blob([csvRows.join("\\n")], { type: 'text/csv;charset=utf-8;' })));
            link.setAttribute("download", \`chemist_outlet_deliveries_\${getLocalTodayString()}.csv\`);
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }

        async function importFromCSV(input) {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async function(e) {
                const lines = e.target.result.split(/\\r?\\n/);
                if (lines.length <= 1) return alert("Empty file.");
                const imported = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim(); if (!line) continue;
                    let tokens = [], current = '', inQuotes = false;
                    for (let c = 0; c < line.length; c++) {
                        let char = line[c];
                        if (char === '"') inQuotes = !inQuotes;
                        else if (char === ',' && !inQuotes) { tokens.push(current.trim()); current = ''; }
                        else current += char;
                    }
                    tokens.push(current.trim());
                    const clean = tokens.map(t => t.replace(/^"|"$/g, '').replace(/""/g, '"'));
                    if (clean.length >= 7) {
                        imported.push({ id: Date.now() + i, date: clean[0], customerName: clean[1], phone: clean[2], address: clean[3], products: clean[4], paymentStatus: clean[5], type: clean[6], frequency: parseInt(clean[7]) || 30 });
                    }
                }
                if (imported.length > 0 && confirm(\`Merge \${imported.length} entries with system database?\`)) {
                    const existing = await getDeliveriesFromServer();
                    await saveDeliveriesToServer([...existing, ...imported]);
                }
                input.value = '';
            };
            reader.readAsText(file);
        }

        async function clearAllData() {
            if(confirm("Wipe server datasets?")) await saveDeliveriesToServer([]);
        }
    </script>
</body>
</html>`;

// Serve the API and the Application Logic
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve the UI layout on default pathing
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(HTML_CONTENT);
    } 
    // Data Sync Read Pipeline
    else if (req.url === '/api/deliveries' && req.method === 'GET') {
        fs.readFile(DATA_FILE, (err, content) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        });
    } 
    // Data Sync Write Pipeline
    else if (req.url === '/api/deliveries' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                JSON.parse(body);
                fs.writeFile(DATA_FILE, body, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Failed to write dataset' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    }
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Malformed payload structured formatting' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Route Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`🚀 WARRALILY CONSOLIDATED HUB IS ONLINE`);
    console.log(`===================================================`);
    console.log(`Host Machine Link: http://localhost:${PORT}`);
    console.log(`\nNetwork Terminal Access Point Link:`);
    console.log(`Identify this device's Local IP Address via terminal.`);
    console.log(`Open on any other network screen: http://<LOCAL_IP>:${PORT}`);
    console.log(`===================================================`);
});
