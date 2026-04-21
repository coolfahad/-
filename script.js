const FIELDS = [
    { id: 1, name: 'ملعب كرة قدم', icon: '⚽', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%2322c55e" width="400" height="200"/><circle cx="200" cy="100" r="60" fill="none" stroke="white" stroke-width="3"/><circle cx="200" cy="100" r="5" fill="white"/><circle cx="170" cy="80" r="3" fill="white"/><circle cx="230" cy="120" r="3" fill="white"/><circle cx="180" cy="110" r="3" fill="white"/><circle cx="220" cy="90" r="3" fill="white"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة قدم</text></svg>' },
    { id: 2, name: 'ملعب كرة سلة', icon: '🏀', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f97316" width="400" height="200"/><circle cx="200" cy="100" r="50" fill="none" stroke="white" stroke-width="3"/><path d="M150 100 Q200 70 250 100" fill="none" stroke="white" stroke-width="2"/><path d="M150 100 Q200 130 250 100" fill="none" stroke="white" stroke-width="2"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة سلة</text></svg>' },
    { id: 3, name: 'ملعب كرة طائرة', icon: '🏐', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%238b5cf6" width="400" height="200"/><line x1="50" y1="100" x2="350" y2="100" stroke="white" stroke-width="3" stroke-dasharray="10,5"/><circle cx="200" cy="70" r="25" fill="white" opacity="0.8"/><circle cx="220" cy="80" r="5" fill="%238b5cf6"/><circle cx="190" cy="90" r="4" fill="%238b5cf6"/><circle cx="210" cy="60" r="3" fill="%238b5cf6"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">كرة طائرة</text></svg>' },
    { id: 4, name: 'ملعب تنس', icon: '🎾', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%2310b981" width="400" height="200"/><rect x="100" y="40" width="200" height="120" fill="none" stroke="white" stroke-width="3"/><line x1="200" y1="40" x2="200" y2="160" stroke="white" stroke-width="2"/><circle cx="220" cy="80" r="12" fill="white"/><circle cx="225" cy="75" r="3" fill="%2310b981"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="14">تنس</text></svg>' }
];

let currentUser = null;
let selectedField = null;

function init() {
    displayCurrentDate();
    checkLogin();
    renderFields();
}

function displayCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ar-SA', options);
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function checkLogin() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showBookingPage();
    }
}

function login() {
    const idInput = document.getElementById('teacherId');
    const nameInput = document.getElementById('teacherName');
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!id) {
        alert('الرجاء إدخال رقم الهوية');
        return;
    }
    
    if (!name) {
        alert('الرجاء إدخال الاسم');
        return;
    }
    
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    let teacher = teachers.find(t => t.idNumber === id);
    
    if (!teacher) {
        teacher = { 
            id: Date.now(), 
            idNumber: id, 
            name: name
        };
        teachers.push(teacher);
    } else {
        teacher.name = name;
    }
    
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    currentUser = teacher;
    localStorage.setItem('currentUser', JSON.stringify(teacher));
    showBookingPage();
}

function showBookingPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('bookingPage').classList.remove('hidden');
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userId').textContent = `رقم الهوية: ${currentUser.idNumber}`;
    
    renderFields();
    renderMyBookings();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('bookingPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('teacherId').value = '';
    document.getElementById('teacherName').value = '';
}

function renderFields() {
    const grid = document.getElementById('fieldsGrid');
    const today = getToday();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const todayBookings = bookings.filter(b => b.date === today);
    
    grid.innerHTML = FIELDS.map(field => {
        const booking = todayBookings.find(b => b.fieldId === field.id);
        const isBooked = booking !== undefined;
        const canBook = !isBooked || booking.teacherId === currentUser.id;
        
        let statusHtml = '';
        let buttonHtml = '';
        
        if (isBooked) {
            const teacher = getTeacher(booking.teacherId);
            statusHtml = `
                <span class="field-status booked">محجوز</span>
                <div class="booking-info">
                    <div class="teacher-name">${teacher?.name || 'غير معروف'}</div>
                    <div class="time-range">${formatTime(booking.from)} - ${formatTime(booking.to)}</div>
                </div>
            `;
            buttonHtml = `<button onclick="openBookingModal(${field.id})" ${!canBook ? 'disabled' : ''}>${canBook ? 'تغيير الحجز' : 'مشاهدة'}</button>`;
        } else {
            statusHtml = `<span class="field-status available">متاح</span>`;
            buttonHtml = `<button onclick="openBookingModal(${field.id})">حجز الآن</button>`;
        }
        
        return `
            <div class="field-card">
                <img src="${field.image}" alt="${field.name}" class="field-image">
                <div class="field-icon">${field.icon}</div>
                <h3>${field.name}</h3>
                ${statusHtml}
                ${buttonHtml}
            </div>
        `;
    }).join('');
}

function getTeacher(id) {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    return teachers.find(t => t.id === id);
}

function formatTime(hour) {
    if (hour < 12) return `${hour} صباحاً`;
    if (hour === 12) return `12 ظهراً`;
    return `${hour - 12} ظهراً`;
}

function openBookingModal(fieldId) {
    selectedField = FIELDS.find(f => f.id === fieldId);
    document.getElementById('modalFieldName').textContent = `حجز ${selectedField.name}`;
    document.getElementById('bookingModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    selectedField = null;
}

function confirmBooking() {
    const fromTime = parseInt(document.getElementById('fromTime').value);
    const toTime = parseInt(document.getElementById('toTime').value);
    const today = getToday();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    if (fromTime >= toTime) {
        alert('وقت النهاية يجب أن يكون بعد وقت البداية');
        return;
    }
    
    const existingBooking = bookings.find(b => b.date === today && b.fieldId === selectedField.id);
    if (existingBooking && existingBooking.teacherId !== currentUser.id) {
        alert('هذا الملعب محجوز بالفعل');
        return;
    }
    
    const newBooking = {
        id: existingBooking ? existingBooking.id : Date.now(),
        teacherId: currentUser.id,
        fieldId: selectedField.id,
        fieldName: selectedField.name,
        from: fromTime,
        to: toTime,
        date: today
    };
    
    if (existingBooking) {
        const index = bookings.indexOf(existingBooking);
        bookings[index] = newBooking;
    } else {
        bookings.push(newBooking);
    }
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
    closeModal();
    renderFields();
    renderMyBookings();
    alert('تم الحجز بنجاح!');
}

function renderMyBookings() {
    const container = document.getElementById('myBookings');
    const today = getToday();
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const myBookings = bookings.filter(b => b.date === today && b.teacherId === currentUser.id);
    
    if (myBookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">لا توجد حجوزات</p>';
        return;
    }
    
    container.innerHTML = myBookings.map(booking => {
        const field = FIELDS.find(f => f.id === booking.fieldId);
        return `
            <div class="booking-item">
                <img src="${field?.image || ''}" alt="${booking.fieldName}" class="field-thumb">
                <div class="info">
                    <div class="field-name">${booking.fieldName}</div>
                    <div class="time">${formatTime(booking.from)} - ${formatTime(booking.to)}</div>
                </div>
                <button class="cancel-booking" onclick="cancelBooking(${booking.id})">إلغاء</button>
            </div>
        `;
    }).join('');
}

function cancelBooking(bookingId) {
    if (!confirm('هل أنت متأكد من إلغاء الحجز؟')) return;
    
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const filtered = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(filtered));
    renderFields();
    renderMyBookings();
}

init();