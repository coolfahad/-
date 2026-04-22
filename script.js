const FIELDS = [
    { id: 1, name: 'ملعب كرة قدم', icon: '⚽', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%2322c55e" width="400" height="200"/><circle cx="200" cy="100" r="60" fill="none" stroke="white" stroke-width="3"/><circle cx="200" cy="100" r="5" fill="white"/><circle cx="170" cy="80" r="3" fill="white"/><circle cx="230" cy="120" r="3" fill="white"/><circle cx="180" cy="110" r="3" fill="white"/><circle cx="220" cy="90" r="3" fill="white"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة قدم</text></svg>' },
    { id: 2, name: 'ملعب كرة سلة', icon: '🏀', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f97316" width="400" height="200"/><circle cx="200" cy="100" r="50" fill="none" stroke="white" stroke-width="3"/><path d="M150 100 Q200 70 250 100" fill="none" stroke="white" stroke-width="2"/><path d="M150 100 Q200 130 250 100" fill="none" stroke="white" stroke-width="2"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة سلة</text></svg>' },
    { id: 3, name: 'ملعب كرة طائرة', icon: '🏐', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%238b5cf6" width="400" height="200"/><line x1="50" y1="100" x2="350" y2="100" stroke="white" stroke-width="3" stroke-dasharray="10,5"/><circle cx="200" cy="70" r="25" fill="white" opacity="0.8"/><circle cx="220" cy="80" r="5" fill="%238b5cf6"/><circle cx="190" cy="90" r="4" fill="%238b5cf6"/><circle cx="210" cy="60" r="3" fill="%238b5cf6"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة طائرة</text></svg>' },
    { id: 4, name: 'ملعب تنس', icon: '🎾', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%2310b981" width="400" height="200"/><rect x="100" y="40" width="200" height="120" fill="none" stroke="white" stroke-width="3"/><line x1="200" y1="40" x2="200" y2="160" stroke="white" stroke-width="2"/><circle cx="220" cy="80" r="12" fill="white"/><circle cx="225" cy="75" r="3" fill="%2310b981"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">تنس</text></svg>' }
];

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = '123456';

let currentUser = null;
let currentRole = 'teacher';
let currentWeekOffset = 0;
let fieldFilter = 'all';

function init() {
    displayCurrentDate();
    checkLogin();
    loadData();
}

function displayCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-SA', options);
    document.getElementById('bookingDate').value = now.toISOString().split('T')[0];
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function checkLogin() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainPage();
    }
}

function login() {
    const idInput = document.getElementById('teacherId');
    const nameInput = document.getElementById('teacherName');
    const id = idInput.value.trim();
    const name = nameInput.value.trim();

    if (!id) {
        showToast('الرجاء إدخال رقم الهوية');
        return;
    }

    if (!name) {
        showToast('الرجاء إدخال الاسم');
        return;
    }

    if (id === ADMIN_ID && name === ADMIN_PASSWORD) {
        currentUser = { id: ADMIN_ID, name: 'المدير', role: 'admin' };
    } else {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        let teacher = teachers.find(t => t.idNumber === id);

        if (!teacher) {
            teacher = { id: Date.now(), idNumber: id, name: name, role: 'teacher' };
            teachers.push(teacher);
            localStorage.setItem('teachers', JSON.stringify(Teachers));
        } else {
            teacher.name = name;
        }

        currentUser = teacher;
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainPage();
}

function showMainPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');

    if (currentUser.role === 'admin') {
        document.getElementById('adminTab').style.display = 'block';
    } else {
        document.getElementById('adminTab').style.display = 'none';
    }

    updateStats();
    showTab('fields');
}

function updateStats() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const today = getToday();
    const todayBookings = bookings.filter(b => b.date === today);
    const availableCount = FIELDS.filter(f => !todayBookings.find(b => b.fieldId === f.id)).length;

    document.getElementById('totalFields').textContent = FIELDS.length;
    document.getElementById('todayBookings').textContent = todayBookings.length;
    document.getElementById('availableFields').textContent = availableCount;
    document.getElementById('totalTeachers').textContent = teachers.length;
}

function switchRole() {
    if (currentRole === 'teacher') {
        currentRole = 'admin';
        document.getElementById('roleBtn').textContent = '⚙️ دور مدير';
    } else {
        currentRole = 'teacher';
        document.getElementById('roleBtn').textContent = '👤 دور معلم';
    }
    showTab('fields');
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentRole = 'teacher';
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherName').value = '';
}

function showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

    switch(tabName) {
        case 'fields':
            document.getElementById('fieldsTab').classList.remove('hidden');
            renderFields();
            break;
        case 'weekly':
            document.getElementById('weeklyTab').classList.remove('hidden');
            renderWeekly();
            break;
        case 'mybookings':
            document.getElementById('mybookingsTab').classList.remove('hidden');
            renderMyBookings();
            break;
        case 'admin':
            document.getElementById('adminTab').classList.remove('hidden');
            renderAdmin();
            break;
    }
}

function renderFields() {
    const grid = document.getElementById('fieldsGrid');
    const today = getToday();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const todayBookings = bookings.filter(b => b.date === today);

    grid.innerHTML = FIELDS.map(field => {
        const booking = todayBookings.find(b => b.fieldId === field.id);
        const isBooked = booking !== undefined;
        const canBook = !isBooked || (currentUser.role === 'admin');

        let filtered = true;
        if (fieldFilter === 'available') filtered = !isBooked;
        if (fieldFilter === 'booked') filtered = isBooked;

        if (!filtered) return '';

        const statusHtml = isBooked ? `
            <span class="status-badge booked">محجوز</span>
            <div class="booking-details">
                <div class="teacher-name">👤 ${getTeacherName(booking.teacherId)}</div>
                <div class="time-range">🕐 ${formatTime(booking.from)} - ${formatTime(booking.to)}</div>
            </div>
        ` : `<span class="status-badge available">متاح</span>`;

        return `
            <div class="field-card">
                <img src="${field.image}" alt="${field.name}" class="field-image">
                <div class="field-info">
                    <div class="field-name">
                        <span class="field-icon">${field.icon}</span>
                        <h3>${field.name}</h3>
                    </div>
                    ${statusHtml}
                    <button class="book-btn" onclick="openBookingModal(${field.id})" ${!canBook ? 'disabled' : ''}>
                        ${isBooked ? (canBook ? 'تغيير الحجز' : 'محجوز') : 'حجز الآن'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterFields(filter) {
    fieldFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderFields();
}

function getTeacherName(teacherId) {
    if (teacherId === ADMIN_ID) return 'المدير';
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'غير معروف';
}

function formatTime(hour) {
    if (hour < 12) return `${hour}:00 صباحاً`;
    if (hour === 12) return `12:00 ظهراً`;
    return `${hour - 12}:00 مساءً`;
}

function openBookingModal(fieldId = null) {
    if (fieldId) {
        document.getElementById('bookingField').value = fieldId;
    }
    document.getElementById('bookingModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('bookingModal').classList.add('hidden');
}

function confirmBooking() {
    const fieldId = parseInt(document.getElementById('bookingField').value);
    const fromTime = parseInt(document.getElementById('fromTime').value);
    const toTime = parseInt(document.getElementById('toTime').value);
    const date = document.getElementById('bookingDate').value || getToday();
    const field = FIELDS.find(f => f.id === fieldId);

    if (fromTime >= toTime) {
        showToast('وقت النهاية يجب أن يكون بعد وقت البداية');
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const existingBooking = bookings.find(b => b.date === date && b.fieldId === fieldId);

    if (existingBooking && existingBooking.teacherId !== currentUser.id && currentUser.role !== 'admin') {
        showToast('هذا الملعب محجوز في هذا التاريخ');
        return;
    }

    const newBooking = {
        id: existingBooking ? existingBooking.id : Date.now(),
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        fieldId: fieldId,
        fieldName: field.name,
        from: fromTime,
        to: toTime,
        date: date
    };

    if (existingBooking) {
        const index = bookings.indexOf(existingBooking);
        bookings[index] = newBooking;
    } else {
        bookings.push(newBooking);
    }

    localStorage.setItem('bookings', JSON.stringify(bookings));
    closeModal();
    updateStats();
    renderFields();
    renderMyBookings();
    renderWeekly();
    showToast('✅ تم الحجز بنجاح!');
}

function renderMyBookings() {
    const container = document.getElementById('myBookingsList');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const myBookings = bookings.filter(b => b.teacherId === currentUser.id);

    if (myBookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">لا توجد حجوزات</p>';
        return;
    }

    container.innerHTML = myBookings.map(booking => {
        const field = FIELDS.find(f => f.id === booking.fieldId);
        return `
            <div class="booking-card">
                <img src="${field?.image || ''}" alt="${booking.fieldName}">
                <div class="info">
                    <div class="field-name">${booking.fieldName}</div>
                    <div class="time">🕐 ${formatTime(booking.from)} - ${formatTime(booking.to)}</div>
                    <div class="date">📅 ${formatDate(booking.date)}</div>
                </div>
                <button class="cancel-btn" onclick="cancelBooking(${booking.id})">إلغاء</button>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('ar-SA', options);
}

function cancelBooking(bookingId) {
    if (!confirm('هل أنت متأكد من إلغاء الحجز؟')) return;

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const filtered = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(filtered));
    updateStats();
    renderMyBookings();
    renderFields();
    renderWeekly();
    showToast('✅تم إلغاء الحجز');
}

function renderWeekly() {
    const grid = document.getElementById('weeklyGrid');
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + (currentWeekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    document.getElementById('weekRange').textContent = `${formatDate(startOfWeek.toISOString())} - ${formatDate(endOfWeek.toISOString())}`;

    const days = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');

    grid.innerHTML = days.map((day, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => b.date === dateStr);

        return `
            <div class="day-column">
                <div class="day-name">${day}</div>
                <div class="day-bookings">
                    ${dayBookings.map(b => `
                        <div class="booking-item">
                            <strong>${b.fieldName}</strong><br>
                            👤 ${b.teacherName}<br>
                            🕐 ${b.from}:00-${b.to}:00
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function changeWeek(delta) {
    currentWeekOffset += delta;
    renderWeekly();
}

function renderAdmin() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const today = getToday();
    const todayBookings = bookings.filter(b => b.date === today);

    const statsHtml = todayBookings.map(b => `
        <div class="admin-stat-item">
            <span>${b.fieldName}</span>
            <span>👤 ${b.teacherName}</span>
            <span>${formatTime(b.from)} - ${formatTime(b.to)}</span>
        </div>
    `).join('');

    document.getElementById('adminTodayStats').innerHTML = todayBookings.length > 0 ? statsHtml : '<p class="no-bookings">لا توجد حجوزات اليوم</p>';

    const allBookings = bookings.slice(0, 20);
    const tableHtml = allBookings.map(b => `
        <tr>
            <td>${b.fieldName}</td>
            <td>${b.teacherName}</td>
            <td>${formatDate(b.date)}</td>
            <td>${formatTime(b.from)} - ${formatTime(b.to)}</td>
            <td><button onclick="cancelBooking(${b.id})" style="background:red;color:white;padding:5px 10px;border:none;border-radius:5px;cursor:pointer">حذف</button></td>
        </tr>
    `).join('');

    document.getElementById('allBookingsList').innerHTML = `
        <table class="all-bookings-table">
            <thead>
                <tr>
                    <th>الملعب</th>
                    <th>المعلم</th>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>إجراء</th>
                </tr>
            </thead>
            <tbody>${tableHtml}</tbody>
        </table>
    `;
}

function clearAllBookings() {
    if (!confirm('هل أنت متأكد من مسح جميع الحجوزات؟')) return;
    localStorage.setItem('bookings', '[]');
    updateStats();
    renderAdmin();
    renderFields();
    renderMyBookings();
    renderWeekly();
    showToast('✅ تم مسح جميع الحجوزات');
}

function exportData() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const data = { bookings, teachers };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-bookings-${getToday()}.json`;
    a.click();
    showToast('✅ تم تصدير البيانات');
}

function resetSystem() {
    if (!confirm('⚠️ هذا الإجراء سيحذف كل البيانات! هل أنت متأكد؟')) return;
    if (!confirm('للتأكيد، اضغط موافق مرة أخرى')) return;
    localStorage.clear();
    showToast('✅ تم إعادة تعيين النظام');
    logout();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function loadData() {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    if (teachers.length === 0) {
        const defaultTeachers = [
            { id: 1, idNumber: '111', name: 'أحمد محمد', role: 'teacher' },
            { id: 2, idNumber: '222', name: 'علي حسن', role: 'teacher' },
            { id: 3, idNumber: '333', name: 'سعيد عمر', role: 'teacher' }
        ];
        localStorage.setItem('teachers', JSON.stringify(defaultTeachers));
    }
}

function showRegister() {
    showToast('سجل في المدرسة للحصول على رقم هوية');
}

init();