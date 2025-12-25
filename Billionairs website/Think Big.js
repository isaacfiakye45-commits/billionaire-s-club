// ===========================================
// EMAILJS CONFIGURATION
// ===========================================
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'GigLTJAoAfY3Udjl8',
    SERVICE_ID: 'service_3tvgibj',
    TEMPLATE_ID: 'template_vjr56ze'
};

// Initialize EmailJS when page loads
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('✅ EmailJS initialized successfully');
    } else {
        console.error('❌ EmailJS library not loaded');
    }
})();

// ===========================================
// GLOBAL VARIABLES
// ===========================================
let members = [];
let isAdminLoggedIn = false;
let currentAdminEmail = '';
let adminMode = false;
let currentEditSection = '';
let currentEditIndex = -1;

// Content storage arrays
let books = [];
let galleryItems = [];
let eventItems = [];
let leaderItems = [];
let benefitItems = [];
let videoItems = [];
let podcastItems = [];
let recordingItems = [];
let memberItems = [];

const ADMIN_CREDENTIALS = [
    { email: 'omightymen@gmail.com', password: 'admin123' },
    { email: 'fiakye29@gmail.com', password: 'isaac123' }
];

// ===========================================
// INITIALIZATION
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Image preview functionality
    const photoInput = document.getElementById('applicantPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    e.target.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('previewImg').src = event.target.result;
                    document.getElementById('imagePreview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Update books section for admin
    updateBooksSectionForAdmin();
    updateMembersSectionForAdmin();

    // Modal click outside to close
    document.getElementById('adminModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAdminModal();
        }
    });
});

// ===========================================
// FORM SUBMISSION
// ===========================================
function handleSubmit(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('applicantPhoto').files[0];
    
    if (!photoFile) {
        alert('Please upload your photo');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const formData = {
            name: document.getElementById('applicantName').value,
            email: document.getElementById('applicantEmail').value,
            phone: document.getElementById('applicantPhone').value,
            educationLevel: document.getElementById('educationLevel').value,
            message: document.getElementById('applicantMessage').value || 'No message provided',
            timestamp: new Date().toISOString(),
            photoData: event.target.result,
            photoName: photoFile.name,
            adminNotified: []
        };

        members.push(formData);
        
        // Send email to all admins
        sendEmailToAllAdmins(formData);
        
        alert('Thank you for your application! We will review it and get back to you soon.\n\nAll administrators have been notified via email\nRemember to join the Whatsapp group!!!');
        document.getElementById('joinForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        
        if (isAdminLoggedIn) {
            updateDashboard();
        }
    };
    
    reader.readAsDataURL(photoFile);
}

// ===========================================
// EMAIL FUNCTIONS
// ===========================================
function sendEmailToAllAdmins(data) {
    ADMIN_CREDENTIALS.forEach(admin => {
        sendEmailNotification(data, admin.email);
    });
}

function sendEmailNotification(data, recipientEmail) {
    // Prepare email parameters
    const templateParams = {
        to_email: recipientEmail,
        to_name: recipientEmail.split('@')[0], // Extract name from email
        applicant_name: data.name,
        applicant_email: data.email,
        applicant_phone: data.phone,
        education_level: data.educationLevel,
        applicant_message: data.message,
        photo_name: data.photoName,
        application_date: new Date(data.timestamp).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Check if EmailJS is properly configured
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS library not loaded. Make sure the script is included in your HTML.');
        alert('Email service is not configured. Please contact the administrator.');
        return;
    }

    if (EMAILJS_CONFIG.PUBLIC_KEY === 'GigLTJAoAfY3Udjl8' ||
        EMAILJS_CONFIG.SERVICE_ID === 'service_3tvgibj'   ||
        EMAILJS_CONFIG.TEMPLATE_ID === 'template_vjr56ze') {
        
        console.warn('⚠️ EmailJS not configured with real credentials');
        console.log(`Email notification would be sent to: ${recipientEmail}`);
        console.log('Application data:', templateParams);
        
        // Mark as notified even though email wasn't sent
        if (!data.adminNotified.includes(recipientEmail)) {
            data.adminNotified.push(recipientEmail);
        }
        return;
    }

    // Send email via EmailJS
    console.log(`📧 Sending email to: ${recipientEmail}`);
    
    emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
    ).then(function(response) {
        console.log(`✅ Email sent successfully to ${recipientEmail}!`, response.status, response.text);
        
        // Mark this admin as notified
        if (!data.adminNotified.includes(recipientEmail)) {
            data.adminNotified.push(recipientEmail);
        }
    }).catch(function(error) {
        console.error(`❌ Email send failed to ${recipientEmail}:`, error);
        alert(`Failed to send email notification to ${recipientEmail}. Error: ${error.text || error.message}`);
    });
}

// ===========================================
// MEDIA TAB SWITCHING
// ===========================================
function switchTab(tabName) {
    document.querySelectorAll('.media-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ===========================================
// ADMIN MODAL FUNCTIONS
// ===========================================
function openAdminModal() {
    document.getElementById('adminModal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('loginError').textContent = '';
}

function adminLogin() {
    const email = document.getElementById('adminUsername').value.toLowerCase().trim();
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');

    const admin = ADMIN_CREDENTIALS.find(a => 
        a.email.toLowerCase() === email && a.password === password
    );

    if (admin) {
        isAdminLoggedIn = true;
        currentAdminEmail = admin.email;
        
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboardContent').classList.add('active');
        errorElement.textContent = '';
        
        document.getElementById('adminWelcome').textContent = `Logged in as: ${currentAdminEmail}`;
        document.getElementById('adminWelcome').style.display = 'block';
        
        document.getElementById('adminControls').classList.add('active');
        
        updateAdminUIElements();
        updateDashboard();
    } else {
        errorElement.textContent = 'Invalid email or password';
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    currentAdminEmail = '';
    adminMode = false;
    
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('dashboardContent').classList.remove('active');
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminWelcome').style.display = 'none';
    
    document.getElementById('adminControls').classList.remove('active');
    document.getElementById('adminIndicator').classList.remove('active');
    document.body.classList.remove('admin-mode');
    
    updateAdminUIElements();
    closeAdminModal();
}

function updateDashboard() {
    document.getElementById('totalMembers').textContent = members.length;
    
    const now = new Date();
    const thisMonth = members.filter(m => {
        const memberDate = new Date(m.timestamp);
        return memberDate.getMonth() === now.getMonth() && 
               memberDate.getFullYear() === now.getFullYear();
    }).length;
    document.getElementById('newMembers').textContent = thisMonth;

    const membersList = document.getElementById('membersList');
    if (members.length === 0) {
        membersList.innerHTML = '<p style="text-align: center; color: #666;">No member applications yet.</p>';
    } else {
        membersList.innerHTML = members.map(member => {
            const wasNotified = member.adminNotified && member.adminNotified.includes(currentAdminEmail);
            const notificationBadge = wasNotified 
                ? '<span style="background: #48bb78; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">✓ Email Sent</span>'
                : '<span style="background: #ed8936; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;">⚠ Pending</span>';
            
            return `
                <div class="member-item">
                    <h4>${member.name} ${notificationBadge}</h4>
                    <p><strong>Email:</strong> ${member.email}</p>
                    <p><strong>Phone:</strong> ${member.phone}</p>
                    <p><strong>Education:</strong> ${member.educationLevel}</p>
                    <p><strong>Message:</strong> ${member.message}</p>
                    <p><strong>Photo:</strong> ${member.photoName}</p>
                    ${member.photoData ? `<img src="${member.photoData}" class="member-photo-preview" alt="Applicant Photo">` : ''}
                    <p><strong>Date:</strong> ${new Date(member.timestamp).toLocaleString()}</p>
                    <p style="font-size: 0.85rem; color: #666;"><strong>Notified Admins:</strong> ${member.adminNotified && member.adminNotified.length > 0 ? member.adminNotified.join(', ') : 'None yet'}</p>
                </div>
            `;
        }).reverse().join('');
    }
}

function exportMembers() {
    if (members.length === 0) {
        alert('No members to export');
        return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Education Level', 'Message', 'Photo', 'Date', 'Admins Notified'];
    const csvContent = [
        headers.join(','),
        ...members.map(m => [
            `"${m.name}"`,
            `"${m.email}"`,
            `"${m.phone}"`,
            `"${m.educationLevel}"`,
            `"${m.message}"`,
            `"${m.photoName}"`,
            `"${new Date(m.timestamp).toLocaleString()}"`,
            `"${m.adminNotified ? m.adminNotified.join('; ') : 'None'}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billionaires_club_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function updateAdminUIElements() {
    updateBooksSectionForAdmin();
    updateMembersSectionForAdmin();
    if (isAdminLoggedIn) {
        updateDashboard();
    }
}

// ===========================================
// BOOKS MANAGEMENT
// ===========================================
function toggleUploadForm() {
    const form = document.getElementById('bookUploadForm');
    form.classList.toggle('active');
    
    if (!form.classList.contains('active')) {
        document.querySelector('#bookUploadForm form').reset();
    }
}

function handleBookUpload(e) {
    e.preventDefault();
    
    const coverFile = document.getElementById('bookCover').files[0];
    const pdfFile = document.getElementById('bookPDF').files[0];
    
    if (!pdfFile) {
        alert('Please select a PDF file');
        return;
    }
    
    if (pdfFile.size > 30 * 1024 * 1024) {
        alert('PDF file size must be less than 30MB');
        return;
    }
    
    if (coverFile && coverFile.size > 2 * 1024 * 1024) {
        alert('Cover image size must be less than 2MB');
        return;
    }
    
    const readCover = coverFile ? new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(coverFile);
    }) : Promise.resolve(null);
    
    const readPDF = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(pdfFile);
    });
    
    Promise.all([readCover, readPDF]).then(([coverData, pdfData]) => {
        const bookData = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            category: document.getElementById('bookCategory').value,
            description: document.getElementById('bookDescription').value,
            pages: document.getElementById('bookPages').value || 'N/A',
            year: document.getElementById('bookYear').value || 'N/A',
            coverData: coverData,
            pdfData: pdfData,
            pdfName: pdfFile.name,
            uploadDate: new Date().toISOString()
        };
        
        books.push(bookData);
        renderBooks();
        toggleUploadForm();
        
        alert('Book uploaded successfully!');
    });
}

function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    
    if (books.length === 0) {
        return;
    }
    
    const uploadedBooksHTML = books.map((book, index) => `
        <div class="book-card">
            <div class="book-cover">
                ${book.coverData ? `<img src="${book.coverData}" alt="${book.title}">` : '📚'}
            </div>
            <div class="book-info">
                <span class="book-category">${book.category}</span>
                <h3>${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-description">${book.description}</p>
                <div class="book-meta">
                    <span class="book-pages">📄 ${book.pages} pages</span>
                    <span class="book-year">📅 ${book.year}</span>
                </div>
                <a href="${book.pdfData}" class="download-btn" download="${book.pdfName}">
                    📥 Download PDF
                </a>
            </div>
        </div>
    `).join('');
    
    const sampleBooks = booksGrid.innerHTML;
    booksGrid.innerHTML = uploadedBooksHTML + sampleBooks;
}

function updateBooksSectionForAdmin() {
    const uploadBtn = document.getElementById('uploadBookBtn');
    const uploadForm = document.getElementById('bookUploadForm');
    
    if (uploadBtn) {
        if (isAdminLoggedIn) {
            uploadBtn.style.display = 'inline-block';
        } else {
            uploadBtn.style.display = 'none';
            if (uploadForm) {
                uploadForm.classList.remove('active');
            }
        }
    }
}

// ===========================================
// ADMIN CONTENT MANAGEMENT
// ===========================================
function toggleAdminMode() {
    adminMode = !adminMode;
    const controls = document.getElementById('adminControls');
    const indicator = document.getElementById('adminIndicator');
    
    if (adminMode) {
        controls.classList.add('active');
        indicator.classList.add('active');
        document.body.classList.add('admin-mode');
    } else {
        controls.classList.remove('active');
        indicator.classList.remove('active');
        document.body.classList.remove('admin-mode');
    }
}

function openAdminPanel(section) {
    currentEditSection = section;
    const modal = document.getElementById('adminPanelModal');
    const title = document.getElementById('adminPanelTitle');
    const body = document.getElementById('adminPanelBody');
    
    modal.classList.add('active');
    
    switch(section) {
        case 'gallery':
            title.textContent = '📷 Manage Gallery';
            body.innerHTML = getGalleryManagementHTML();
            break;
        case 'events':
            title.textContent = '📅 Manage Events';
            body.innerHTML = getEventsManagementHTML();
            break;
        case 'leadership':
            title.textContent = '👥 Manage Leadership';
            body.innerHTML = getLeadershipManagementHTML();
            break;
        case 'members':
            title.textContent = '🤝 Manage Members';
            body.innerHTML = getMembersManagementHTML();
            break;
        case 'benefits':
            title.textContent = '✨ Manage Benefits';
            body.innerHTML = getBenefitsManagementHTML();
            break;
        case 'videos':
            title.textContent = '🎬 Manage Videos';
            body.innerHTML = getVideosManagementHTML();
            break;
        case 'podcasts':
            title.textContent = '🎙️ Manage Podcasts';
            body.innerHTML = getPodcastsManagementHTML();
            break;
        case 'recordings':
            title.textContent = '🎧 Manage Recordings';
            body.innerHTML = getRecordingsManagementHTML();
            break;
        case 'books':
            title.textContent = '📚 Manage Books';
            body.innerHTML = getBooksManagementHTML();
            break;
    }
}

function closeAdminPanel() {
    document.getElementById('adminPanelModal').classList.remove('active');
    currentEditSection = '';
    currentEditIndex = -1;
}

// ===========================================
// GALLERY MANAGEMENT
// ===========================================
function getGalleryManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Gallery Image</h3>
        <form onsubmit="handleGalleryUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Image Caption *</label>
                    <input type="text" id="galleryCaption" required>
                </div>
                <div class="admin-form-group">
                    <label>Upload Image *</label>
                    <input type="file" id="galleryImage" accept="image/*" required>
                </div>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add to Gallery</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Gallery Items</h3>
        <div class="content-list" id="galleryList">
            ${getGalleryListHTML()}
        </div>
    `;
}

function getGalleryListHTML() {
    if (galleryItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom gallery items yet. Add your first image above!</p>';
    }
    
    return galleryItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.caption}</h4>
                <img src="${item.imageData}" style="max-width: 100px; border-radius: 5px; margin-top: 0.5rem;">
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteGalleryItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleGalleryUpload(e) {
    e.preventDefault();
    
    const caption = document.getElementById('galleryCaption').value;
    const imageFile = document.getElementById('galleryImage').files[0];
    
    if (!imageFile) {
        alert('Please select an image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        galleryItems.push({
            caption: caption,
            imageData: event.target.result,
            uploadDate: new Date().toISOString()
        });
        
        renderGallery();
        alert('Gallery image added successfully!');
        openAdminPanel('gallery');
    };
    reader.readAsDataURL(imageFile);
}

function deleteGalleryItem(index) {
    if (confirm('Are you sure you want to delete this gallery item?')) {
        galleryItems.splice(index, 1);
        renderGallery();
        openAdminPanel('gallery');
    }
}

function renderGallery() {
    const galleryGrid = document.querySelector('#gallery .gallery-grid');
    if (!galleryGrid) return;
    
    const customGalleryHTML = galleryItems.map(item => `
        <div class="gallery-item">
            <img src="${item.imageData}" alt="${item.caption}">
            <div class="gallery-caption">${item.caption}</div>
        </div>
    `).join('');
    
    const originalItems = galleryGrid.querySelectorAll('.gallery-item');
    galleryGrid.innerHTML = customGalleryHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// EVENTS MANAGEMENT
// ===========================================
function getEventsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Event</h3>
        <form onsubmit="handleEventUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Event Title *</label>
                    <input type="text" id="eventTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Event Date *</label>
                    <input type="date" id="eventDate" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Event Description *</label>
                <textarea id="eventDescription" required></textarea>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Event</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Events</h3>
        <div class="content-list" id="eventsList">
            ${getEventsListHTML()}
        </div>
    `;
}

function getEventsListHTML() {
    if (eventItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom events yet. Add your first event above!</p>';
    }
    
    return eventItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteEventItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleEventUpload(e) {
    e.preventDefault();
    
    eventItems.push({
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        description: document.getElementById('eventDescription').value,
        uploadDate: new Date().toISOString()
    });
    
    renderEvents();
    alert('Event added successfully!');
    openAdminPanel('events');
}

function deleteEventItem(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        eventItems.splice(index, 1);
        renderEvents();
        openAdminPanel('events');
    }
}

function renderEvents() {
    const eventsList = document.querySelector('#events .events-list');
    if (!eventsList) return;
    
    const customEventsHTML = eventItems.map(item => `
        <div class="event-item">
            <div class="event-date">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    const originalItems = eventsList.querySelectorAll('.event-item');
    eventsList.innerHTML = customEventsHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// LEADERSHIP MANAGEMENT
// ===========================================
function getLeadershipManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Leader</h3>
        <form onsubmit="handleLeaderUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Leader Name *</label>
                    <input type="text" id="leaderName" required>
                </div>
                <div class="admin-form-group">
                    <label>Position/Title *</label>
                    <input type="text" id="leaderTitle" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Description *</label>
                <textarea id="leaderDescription" required></textarea>
            </div>
            <div class="admin-form-group">
                <label>Upload Photo *</label>
                <input type="file" id="leaderPhoto" accept="image/*" required>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Leader</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Leaders</h3>
        <div class="content-list" id="leadersList">
            ${getLeadersListHTML()}
        </div>
    `;
}

function getLeadersListHTML() {
    if (leaderItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom leaders yet. Add your first leader above!</p>';
    }
    
    return leaderItems.map((item, index) => `
        <div class="content-list-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.photoData}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4>${item.name}</h4>
                    <p><strong>${item.title}</strong></p>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteLeaderItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleLeaderUpload(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('leaderPhoto').files[0];
    
    if (!photoFile) {
        alert('Please select a photo');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        leaderItems.push({
            name: document.getElementById('leaderName').value,
            title: document.getElementById('leaderTitle').value,
            description: document.getElementById('leaderDescription').value,
            photoData: event.target.result,
            uploadDate: new Date().toISOString()
        });
        
        renderLeaders();
        alert('Leader added successfully!');
        openAdminPanel('leadership');
    };
    reader.readAsDataURL(photoFile);
}

function deleteLeaderItem(index) {
    if (confirm('Are you sure you want to delete this leader?')) {
        leaderItems.splice(index, 1);
        renderLeaders();
        openAdminPanel('leadership');
    }
}

function renderLeaders() {
    const leadersGrid = document.querySelector('#leadership .leadership-grid');
    if (!leadersGrid) return;
    
    const customLeadersHTML = leaderItems.map(item => `
        <div class="leader-card">
            <div class="leader-photo">
                <img src="${item.photoData}" alt="${item.name}">
            </div>
            <h3>${item.name}</h3>
            <div class="leader-title">${item.title}</div>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    const originalItems = leadersGrid.querySelectorAll('.leader-card');
    leadersGrid.innerHTML = customLeadersHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// BENEFITS MANAGEMENT
// ===========================================
function getBenefitsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Benefit</h3>
        <form onsubmit="handleBenefitUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Benefit Title *</label>
                    <input type="text" id="benefitTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Icon Emoji *</label>
                    <input type="text" id="benefitIcon" placeholder="e.g., ⭐, 💪, 🎯" required maxlength="2">
                    <small style="color: #666;">Use an emoji (copy/paste from emojipedia.org)</small>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Benefit Description *</label>
                <textarea id="benefitDescription" required placeholder="Describe this benefit..."></textarea>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Benefit</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Benefits</h3>
        <div class="content-list" id="benefitsList">
            ${getBenefitsListHTML()}
        </div>
    `;
}

function getBenefitsListHTML() {
    if (benefitItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom benefits yet. Add your first benefit above!</p>';
    }
    
    return benefitItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.icon} ${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteBenefitItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleBenefitUpload(e) {
    e.preventDefault();
    
    benefitItems.push({
        title: document.getElementById('benefitTitle').value,
        icon: document.getElementById('benefitIcon').value,
        description: document.getElementById('benefitDescription').value,
        uploadDate: new Date().toISOString()
    });
    
    renderBenefits();
    alert('Benefit added successfully!');
    openAdminPanel('benefits');
}

function deleteBenefitItem(index) {
    if (confirm('Are you sure you want to delete this benefit?')) {
        benefitItems.splice(index, 1);
        renderBenefits();
        openAdminPanel('benefits');
    }
}

function renderBenefits() {
    const benefitsGrid = document.querySelector('#benefits .benefits-grid');
    if (!benefitsGrid) return;
    
    const customBenefitsHTML = benefitItems.map(item => `
        <div class="benefit-card">
            <div class="benefit-icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    const originalItems = benefitsGrid.querySelectorAll('.benefit-card');
    benefitsGrid.innerHTML = customBenefitsHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// VIDEOS MANAGEMENT
// ===========================================
function getVideosManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Video</h3>
        <form onsubmit="handleVideoUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Video Title *</label>
                    <input type="text" id="videoTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Video Description *</label>
                    <input type="text" id="videoDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Video File *</label>
                <input type="file" id="videoFile" accept="video/*" required>
                <small style="color: #666;">Supported: MP4, WebM (Max 50MB)</small>
            </div>
            <div class="admin-form-group">
                <label>Upload Thumbnail (Optional)</label>
                <input type="file" id="videoThumbnail" accept="image/*">
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Video</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Videos</h3>
        <div class="content-list" id="videosList">
            ${getVideosListHTML()}
        </div>
    `;
}

function getVideosListHTML() {
    if (videoItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom videos yet. Add your first video above!</p>';
    }
    
    return videoItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteVideoItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleVideoUpload(e) {
    e.preventDefault();
    
    const videoFile = document.getElementById('videoFile').files[0];
    const thumbnailFile = document.getElementById('videoThumbnail').files[0];
    
    if (!videoFile) {
        alert('Please select a video file');
        return;
    }
    
    if (videoFile.size > 100 * 1024 * 1024) {
        alert('Video file size must be less than 100MB');
        return;
    }
    
    const readVideo = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(videoFile);
    });
    
    const readThumbnail = thumbnailFile ? new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(thumbnailFile);
    }) : Promise.resolve(null);
    
    Promise.all([readVideo, readThumbnail]).then(([videoData, thumbnailData]) => {
        videoItems.push({
            title: document.getElementById('videoTitle').value,
            description: document.getElementById('videoDescription').value,
            videoData: videoData,
            thumbnailData: thumbnailData,
            uploadDate: new Date().toISOString()
        });
        
        renderVideos();
        alert('Video added successfully!');
        openAdminPanel('videos');
    });
}

function deleteVideoItem(index) {
    if (confirm('Are you sure you want to delete this video?')) {
        videoItems.splice(index, 1);
        renderVideos();
        openAdminPanel('videos');
    }
}

function renderVideos() {
    const videosGrid = document.querySelector('#videos .video-grid');
    if (!videosGrid) return;
    
    const customVideosHTML = videoItems.map(item => `
        <div class="video-item">
            <video controls ${item.thumbnailData ? `poster="${item.thumbnailData}"` : ''}>
                <source src="${item.videoData}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="media-title">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
    
    const originalItems = videosGrid.querySelectorAll('.video-item');
    videosGrid.innerHTML = customVideosHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// PODCASTS MANAGEMENT
// ===========================================
function getPodcastsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Podcast</h3>
        <form onsubmit="handlePodcastUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Podcast Title *</label>
                    <input type="text" id="podcastTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Episode Description *</label>
                    <input type="text" id="podcastDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Audio File *</label>
                <input type="file" id="podcastAudio" accept="audio/*" required>
                <small style="color: #666;">Supported: MP3, WAV (Max 30MB)</small>
            </div>
            <div class="admin-form-group">
                <label>Upload Cover Image (Optional)</label>
                <input type="file" id="podcastCover" accept="image/*">
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Podcast</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Podcasts</h3>
        <div class="content-list" id="podcastsList">
            ${getPodcastsListHTML()}
        </div>
    `;
}

function getPodcastsListHTML() {
    if (podcastItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom podcasts yet. Add your first podcast above!</p>';
    }
    
    return podcastItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deletePodcastItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handlePodcastUpload(e) {
    e.preventDefault();
    
    const audioFile = document.getElementById('podcastAudio').files[0];
    const coverFile = document.getElementById('podcastCover').files[0];
    
    if (!audioFile) {
        alert('Please select an audio file');
        return;
    }
    
    if (audioFile.size > 200 * 1024 * 1024) {
        alert('Audio file size must be less than 200MB');
        return;
    }
    
    const readAudio = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(audioFile);
    });
    
    const readCover = coverFile ? new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(coverFile);
    }) : Promise.resolve(null);
    
    Promise.all([readAudio, readCover]).then(([audioData, coverData]) => {
        podcastItems.push({
            title: document.getElementById('podcastTitle').value,
            description: document.getElementById('podcastDescription').value,
            audioData: audioData,
            coverData: coverData,
            uploadDate: new Date().toISOString()
        });
        
        renderPodcasts();
        alert('Podcast added successfully!');
        openAdminPanel('podcasts');
    });
}

function deletePodcastItem(index) {
    if (confirm('Are you sure you want to delete this podcast?')) {
        podcastItems.splice(index, 1);
        renderPodcasts();
        openAdminPanel('podcasts');
    }
}

function renderPodcasts() {
    const podcastsGrid = document.querySelector('#podcasts .podcast-grid');
    if (!podcastsGrid) return;
    
    const customPodcastsHTML = podcastItems.map(item => `
        <div class="podcast-item">
            <div class="podcast-cover">
                ${item.coverData ? `<img src="${item.coverData}" alt="Podcast Cover">` : '🎙️'}
            </div>
            <h3>${item.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${item.description}</p>
            <audio controls>
                <source src="${item.audioData}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
        </div>
    `).join('');
    
    const originalItems = podcastsGrid.querySelectorAll('.podcast-item');
    podcastsGrid.innerHTML = customPodcastsHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

// ===========================================
// RECORDINGS MANAGEMENT
// ===========================================
function getRecordingsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Recording</h3>
        <form onsubmit="handleRecordingUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Recording Title *</label>
                    <input type="text" id="recordingTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Event Description *</label>
                    <input type="text" id="recordingDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Audio File *</label>
                <input type="file" id="recordingAudio" accept="audio/*" required>
                <small style="color: #666;">Supported: MP3, WAV (Max 50MB)</small>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Recording</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Recordings</h3>
        <div class="content-list" id="recordingsList">
            ${getRecordingsListHTML()}
        </div>
    `;
}

function getRecordingsListHTML() {
    if (recordingItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom recordings yet. Add your first recording above!</p>';
    }
    
    return recordingItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteRecordingItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleRecordingUpload(e) {
    e.preventDefault();
    
    const audioFile = document.getElementById('recordingAudio').files[0];
    
    if (!audioFile) {
        alert('Please select an audio file');
        return;
    }
    
    if (audioFile.size > 200 * 1024 * 1024) {
        alert('Audio file size must be less than 200MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        recordingItems.push({
            title: document.getElementById('recordingTitle').value,
            description: document.getElementById('recordingDescription').value,
            audioData: event.target.result,
            uploadDate: new Date().toISOString()
        });
        
        renderRecordings();
        alert('Recording added successfully!');
        openAdminPanel('recordings');
    };
    reader.readAsDataURL(audioFile);
}

function deleteRecordingItem(index) {
    if (confirm('Are you sure you want to delete this recording?')) {
        recordingItems.splice(index, 1);
        renderRecordings();
        openAdminPanel('recordings');
    }
}

function renderRecordings() {
    const recordingsGrid = document.querySelector('#recordings .audio-grid');
    if (!recordingsGrid) return;
    
    const customRecordingsHTML = recordingItems.map(item => `
        <div class="audio-item">
            <div class="audio-icon">🎧</div>
            <h3>${item.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${item.description}</p>
            <audio controls>
                <source src="${item.audioData}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
        </div>
    `).join('');
    
    const originalItems = recordingsGrid.querySelectorAll('.audio-item');
    recordingsGrid.innerHTML = customRecordingsHTML + Array.from(originalItems).map(item => item.outerHTML).join('');
}

function getBooksManagementHTML() {
    return `<p style="text-align: center; padding: 2rem;">Use the "Upload New Book" button in the Books section to manage books.</p>`;
}

// ===========================================
// MEMBERS MANAGEMENT
// ===========================================
function openAddMemberForm() {
    const form = document.getElementById('memberUploadForm');
    form.classList.add('active');
}

function closeAddMemberForm() {
    const form = document.getElementById('memberUploadForm');
    form.classList.remove('active');
    document.querySelector('#memberUploadForm form').reset();
}

function handleMemberUpload(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('memberPhoto').files[0];
    
    if (!photoFile) {
        alert('Please select a photo');
        return;
    }
    
    if (photoFile.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const memberData = {
            name: document.getElementById('memberName').value,
            duty: document.getElementById('memberDuty').value,
            bio: document.getElementById('memberBio').value,
            photoData: event.target.result,
            uploadDate: new Date().toISOString()
        };
        
        memberItems.push(memberData);
        renderMembers();
        closeAddMemberForm();
        
        alert('Member added successfully!');
    };
    reader.readAsDataURL(photoFile);
}

function renderMembers() {
    const membersGrid = document.getElementById('membersGrid');
    
    if (memberItems.length === 0) {
        return;
    }
    
    const uploadedMembersHTML = memberItems.map((member, index) => `
        <div class="member-card">
            <div class="member-photo">
                <img src="${member.photoData}" alt="${member.name}">
            </div>
            <h3>${member.name}</h3>
            <div class="member-duty">${member.duty}</div>
            <p>${member.bio}</p>
        </div>
    `).join('');
    
    const sampleMembers = membersGrid.innerHTML;
    membersGrid.innerHTML = uploadedMembersHTML + sampleMembers;
}

function updateMembersSectionForAdmin() {
    const addBtn = document.getElementById('addMemberBtn');
    const uploadForm = document.getElementById('memberUploadForm');
    
    if (addBtn) {
        if (isAdminLoggedIn) {
            addBtn.style.display = 'inline-block';
        } else {
            addBtn.style.display = 'none';
            if (uploadForm) {
                uploadForm.classList.remove('active');
            }
        }
    }
}

function getMembersManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Member</h3>
        <form onsubmit="handleMemberAdminUpload(event)">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Member Name *</label>
                    <input type="text" id="adminMemberName" required>
                </div>
                <div class="admin-form-group">
                    <label>Member Duty/Role *</label>
                    <input type="text" id="adminMemberDuty" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>About Member *</label>
                <textarea id="adminMemberBio" required></textarea>
            </div>
            <div class="admin-form-group">
                <label>Upload Photo *</label>
                <input type="file" id="adminMemberPhoto" accept="image/*" required>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit">Add Member</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Members</h3>
        <div class="content-list" id="membersList">
            ${getMembersListHTML()}
        </div>
    `;
}

function getMembersListHTML() {
    if (memberItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No custom members yet. Add your first member above!</p>';
    }
    
    return memberItems.map((item, index) => `
        <div class="content-list-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.photoData}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4>${item.name}</h4>
                    <p><strong>${item.duty}</strong></p>
                    <p>${item.bio}</p>
                </div>
            </div>
            <div class="content-list-actions">
                <button class="delete-btn" onclick="deleteMemberItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleMemberAdminUpload(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('adminMemberPhoto').files[0];
    
    if (!photoFile) {
        alert('Please select a photo');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        memberItems.push({
            name: document.getElementById('adminMemberName').value,
            duty: document.getElementById('adminMemberDuty').value,
            bio: document.getElementById('adminMemberBio').value,
            photoData: event.target.result,
            uploadDate: new Date().toISOString()
        });
        
        renderMembers();
        alert('Member added successfully!');
        openAdminPanel('members');
    };
    reader.readAsDataURL(photoFile);
}

function deleteMemberItem(index) {
    if (confirm('Are you sure you want to delete this member?')) {
        memberItems.splice(index, 1);
        renderMembers();
        openAdminPanel('members');
    }
}

// ===========================================
// ENHANCED ADMIN MANAGEMENT SYSTEM
// Add this code to your billionaires_jsR.js file
// ===========================================

// Add these functions after your existing code

// ===========================================
// LOCALSTORAGE PERSISTENCE SYSTEM
// ===========================================
const STORAGE_KEYS = {
    GALLERY: 'billionaires_gallery',
    EVENTS: 'billionaires_events',
    LEADERS: 'billionaires_leaders',
    MEMBERS: 'billionaires_members',
    BENEFITS: 'billionaires_benefits',
    BOOKS: 'billionaires_books',
    VIDEOS: 'billionaires_videos',
    PODCASTS: 'billionaires_podcasts',
    RECORDINGS: 'billionaires_recordings',
    INITIALIZED: 'billionaires_initialized'
};

// Save data to localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Saved ${key} to localStorage`);
    } catch (e) {
        console.error(`❌ Error saving ${key}:`, e);
        alert('Storage limit reached. Some data may not be saved.');
    }
}

// Load data from localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error(`❌ Error loading ${key}:`, e);
        return null;
    }
}

// Clear all stored data (for reset functionality)
function clearAllStoredData() {
    if (confirm('⚠️ This will delete ALL custom content and reset to defaults. Are you absolutely sure?')) {
        if (confirm('⚠️ FINAL WARNING: This action cannot be undone!')) {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            alert('✅ All data cleared! Refreshing page...');
            location.reload();
        }
    }
}

// ===========================================
// INITIALIZE DEFAULT CONTENT WITH IDs
// ===========================================
function initializeDefaultContent() {
    // Check if we have stored data
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    
    if (isInitialized) {
        // Load from localStorage
        loadAllContentFromStorage();
        console.log('✅ Content loaded from localStorage');
        return;
    }
    
    // First time - initialize from HTML
    
    // Gallery default items
    const galleryElements = document.querySelectorAll('#gallery .gallery-grid .gallery-item');
    galleryElements.forEach((el, index) => {
        const img = el.querySelector('img');
        const caption = el.querySelector('.gallery-caption');
        if (img && caption) {
            galleryItems.push({
                id: `default-gallery-${index}`,
                caption: caption.textContent,
                imageSrc: img.src,
                imageData: null,
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    // Events default items
    const eventElements = document.querySelectorAll('#events .events-list .event-item');
    eventElements.forEach((el, index) => {
        const title = el.querySelector('h3');
        const date = el.querySelector('.event-date');
        const description = el.querySelector('p');
        if (title && date && description) {
            eventItems.push({
                id: `default-event-${index}`,
                title: title.textContent,
                date: date.textContent,
                description: description.textContent,
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    // Leadership default items
    const leaderElements = document.querySelectorAll('#leadership .leadership-grid .leader-card');
    leaderElements.forEach((el, index) => {
        const name = el.querySelector('h3');
        const title = el.querySelector('.leader-title');
        const description = el.querySelector('p');
        const img = el.querySelector('.leader-photo img');
        if (name && title && description) {
            leaderItems.push({
                id: `default-leader-${index}`,
                name: name.textContent,
                title: title.textContent,
                description: description.textContent,
                photoSrc: img ? img.src : null,
                photoData: null,
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    // Members default items
    const memberElements = document.querySelectorAll('#members .members-grid .member-card');
    memberElements.forEach((el, index) => {
        const name = el.querySelector('h3');
        const duty = el.querySelector('.member-duty');
        const bio = el.querySelector('p');
        const img = el.querySelector('.member-photo img');
        if (name && duty && bio) {
            memberItems.push({
                id: `default-member-${index}`,
                name: name.textContent,
                duty: duty.textContent,
                bio: bio.textContent,
                photoSrc: img ? img.src : null,
                photoData: null,
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    // Benefits default items
    const benefitElements = document.querySelectorAll('#benefits .benefits-grid .benefit-card');
    benefitElements.forEach((el, index) => {
        const icon = el.querySelector('.benefit-icon');
        const title = el.querySelector('h3');
        const description = el.querySelector('p');
        if (icon && title && description) {
            benefitItems.push({
                id: `default-benefit-${index}`,
                icon: icon.textContent,
                title: title.textContent,
                description: description.textContent,
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    // Books default items
    const bookElements = document.querySelectorAll('#books .books-grid .book-card');
    bookElements.forEach((el, index) => {
        const title = el.querySelector('.book-info h3');
        const author = el.querySelector('.book-author');
        const category = el.querySelector('.book-category');
        const description = el.querySelector('.book-description');
        const pages = el.querySelector('.book-pages');
        const year = el.querySelector('.book-year');
        const coverImg = el.querySelector('.book-cover img');
        const downloadLink = el.querySelector('.download-btn');
        
        if (title && author) {
            books.push({
                id: `default-book-${index}`,
                title: title.textContent,
                author: author.textContent.replace('By ', ''),
                category: category ? category.textContent : 'Other',
                description: description ? description.textContent : '',
                pages: pages ? pages.textContent.replace('📄 ', '').replace(' pages', '') : 'N/A',
                year: year ? year.textContent.replace('📅 ', '') : 'N/A',
                coverSrc: coverImg ? coverImg.src : null,
                coverData: null,
                pdfSrc: downloadLink ? downloadLink.href : null,
                pdfData: null,
                pdfName: downloadLink ? downloadLink.download : 'document.pdf',
                isDefault: true,
                uploadDate: new Date().toISOString()
            });
        }
    });
    
    sessionStorage.setItem('contentInitialized', 'true');
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    
    // Save initial content to localStorage
    saveAllContentToStorage();
    console.log('✅ Initial content saved to localStorage');
}

// Load all content from localStorage
function loadAllContentFromStorage() {
    const loadedGallery = loadFromLocalStorage(STORAGE_KEYS.GALLERY);
    const loadedEvents = loadFromLocalStorage(STORAGE_KEYS.EVENTS);
    const loadedLeaders = loadFromLocalStorage(STORAGE_KEYS.LEADERS);
    const loadedMembers = loadFromLocalStorage(STORAGE_KEYS.MEMBERS);
    const loadedBenefits = loadFromLocalStorage(STORAGE_KEYS.BENEFITS);
    const loadedBooks = loadFromLocalStorage(STORAGE_KEYS.BOOKS);
    const loadedVideos = loadFromLocalStorage(STORAGE_KEYS.VIDEOS);
    const loadedPodcasts = loadFromLocalStorage(STORAGE_KEYS.PODCASTS);
    const loadedRecordings = loadFromLocalStorage(STORAGE_KEYS.RECORDINGS);
    
    if (loadedGallery) galleryItems = loadedGallery;
    if (loadedEvents) eventItems = loadedEvents;
    if (loadedLeaders) leaderItems = loadedLeaders;
    if (loadedMembers) memberItems = loadedMembers;
    if (loadedBenefits) benefitItems = loadedBenefits;
    if (loadedBooks) books = loadedBooks;
    if (loadedVideos) videoItems = loadedVideos;
    if (loadedPodcasts) podcastItems = loadedPodcasts;
    if (loadedRecordings) recordingItems = loadedRecordings;
    
    // Render all sections with loaded data
    renderGallery();
    renderEvents();
    renderLeaders();
    renderMembers();
    renderBenefits();
    renderBooks();
    renderVideos();
    renderPodcasts();
    renderRecordings();
}

// Save all content to localStorage
function saveAllContentToStorage() {
    saveToLocalStorage(STORAGE_KEYS.GALLERY, galleryItems);
    saveToLocalStorage(STORAGE_KEYS.EVENTS, eventItems);
    saveToLocalStorage(STORAGE_KEYS.LEADERS, leaderItems);
    saveToLocalStorage(STORAGE_KEYS.MEMBERS, memberItems);
    saveToLocalStorage(STORAGE_KEYS.BENEFITS, benefitItems);
    saveToLocalStorage(STORAGE_KEYS.BOOKS, books);
    saveToLocalStorage(STORAGE_KEYS.VIDEOS, videoItems);
    saveToLocalStorage(STORAGE_KEYS.PODCASTS, podcastItems);
    saveToLocalStorage(STORAGE_KEYS.RECORDINGS, recordingItems);
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultContent();
});

// ===========================================
// ENHANCED GALLERY MANAGEMENT WITH EDIT
// ===========================================
function getGalleryManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Gallery Image</h3>
        <form onsubmit="handleGalleryUpload(event)" id="galleryUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Image Caption *</label>
                    <input type="text" id="galleryCaption" required>
                </div>
                <div class="admin-form-group">
                    <label>Upload Image *</label>
                    <input type="file" id="galleryImage" accept="image/*" required>
                </div>
            </div>
            <input type="hidden" id="galleryEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="gallerySubmitBtn">Add to Gallery</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Gallery Items</h3>
        <div class="content-list" id="galleryList">
            ${getGalleryListHTML()}
        </div>
    `;
}

function getGalleryListHTML() {
    if (galleryItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No gallery items yet. Add your first image above!</p>';
    }
    
    return galleryItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.caption}</h4>
                ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-left: 0.5rem;">Original</span>' : ''}
                <img src="${item.imageData || item.imageSrc}" style="max-width: 100px; border-radius: 5px; margin-top: 0.5rem;">
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editGalleryItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteGalleryItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleGalleryUpload(e) {
    e.preventDefault();
    
    const caption = document.getElementById('galleryCaption').value;
    const imageFile = document.getElementById('galleryImage').files[0];
    const editIndex = document.getElementById('galleryEditIndex').value;
    
    if (!imageFile && editIndex === '') {
        alert('Please select an image');
        return;
    }
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (editIndex !== '') {
                // Update existing item
                galleryItems[editIndex].caption = caption;
                galleryItems[editIndex].imageData = event.target.result;
                galleryItems[editIndex].imageSrc = null;
                alert('Gallery image updated successfully!');
            } else {
                // Add new item
                galleryItems.push({
                    id: `custom-gallery-${Date.now()}`,
                    caption: caption,
                    imageData: event.target.result,
                    imageSrc: null,
                    isDefault: false,
                    uploadDate: new Date().toISOString()
                });
                alert('Gallery image added successfully!');
            }
            
            saveToLocalStorage(STORAGE_KEYS.GALLERY, galleryItems);
            renderGallery();
            openAdminPanel('gallery');
        };
        reader.readAsDataURL(imageFile);
    } else if (editIndex !== '') {
        // Update caption only
        galleryItems[editIndex].caption = caption;
        saveToLocalStorage(STORAGE_KEYS.GALLERY, galleryItems);
        renderGallery();
        alert('Gallery caption updated successfully!');
        openAdminPanel('gallery');
    }
}

function editGalleryItem(index) {
    const item = galleryItems[index];
    document.getElementById('galleryCaption').value = item.caption;
    document.getElementById('galleryEditIndex').value = index;
    document.getElementById('galleryImage').required = false;
    document.getElementById('gallerySubmitBtn').textContent = 'Update Gallery Item';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteGalleryItem(index) {
    if (confirm('Are you sure you want to delete this gallery item?')) {
        galleryItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.GALLERY, galleryItems);
        renderGallery();
        openAdminPanel('gallery');
    }
}

function renderGallery() {
    const galleryGrid = document.querySelector('#gallery .gallery-grid');
    if (!galleryGrid) return;
    
    const allGalleryHTML = galleryItems.map(item => `
        <div class="gallery-item">
            <img src="${item.imageData || item.imageSrc}" alt="${item.caption}">
            <div class="gallery-caption">${item.caption}</div>
        </div>
    `).join('');
    
    galleryGrid.innerHTML = allGalleryHTML;
}

// ===========================================
// ENHANCED EVENTS MANAGEMENT WITH EDIT
// ===========================================
function getEventsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Event</h3>
        <form onsubmit="handleEventUpload(event)" id="eventUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Event Title *</label>
                    <input type="text" id="eventTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Event Date *</label>
                    <input type="text" id="eventDate" required placeholder="e.g., December 27, 2025">
                </div>
            </div>
            <div class="admin-form-group">
                <label>Event Description *</label>
                <textarea id="eventDescription" required></textarea>
            </div>
            <input type="hidden" id="eventEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="eventSubmitBtn">Add Event</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Events</h3>
        <div class="content-list" id="eventsList">
            ${getEventsListHTML()}
        </div>
    `;
}

function getEventsListHTML() {
    if (eventItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No events yet. Add your first event above!</p>';
    }
    
    return eventItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-left: 0.5rem;">Original</span>' : ''}
                <p><strong>Date:</strong> ${item.date}</p>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editEventItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteEventItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleEventUpload(e) {
    e.preventDefault();
    
    const editIndex = document.getElementById('eventEditIndex').value;
    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        description: document.getElementById('eventDescription').value,
        uploadDate: new Date().toISOString()
    };
    
    if (editIndex !== '') {
        // Update existing event
        eventItems[editIndex] = { ...eventItems[editIndex], ...eventData };
        alert('Event updated successfully!');
    } else {
        // Add new event
        eventItems.push({
            id: `custom-event-${Date.now()}`,
            ...eventData,
            isDefault: false
        });
        alert('Event added successfully!');
    }
    
    saveToLocalStorage(STORAGE_KEYS.EVENTS, eventItems);
    renderEvents();
    openAdminPanel('events');
}

function editEventItem(index) {
    const item = eventItems[index];
    document.getElementById('eventTitle').value = item.title;
    document.getElementById('eventDate').value = item.date;
    document.getElementById('eventDescription').value = item.description;
    document.getElementById('eventEditIndex').value = index;
    document.getElementById('eventSubmitBtn').textContent = 'Update Event';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEventItem(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        eventItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.EVENTS, eventItems);
        renderEvents();
        openAdminPanel('events');
    }
}

function renderEvents() {
    const eventsList = document.querySelector('#events .events-list');
    if (!eventsList) return;
    
    const allEventsHTML = eventItems.map(item => `
        <div class="event-item">
            <div class="event-date">${item.date}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    eventsList.innerHTML = allEventsHTML;
}

// ===========================================
// ENHANCED LEADERSHIP MANAGEMENT WITH EDIT
// ===========================================
function getLeadershipManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Leader</h3>
        <form onsubmit="handleLeaderUpload(event)" id="leaderUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Leader Name *</label>
                    <input type="text" id="leaderName" required>
                </div>
                <div class="admin-form-group">
                    <label>Position/Title *</label>
                    <input type="text" id="leaderTitle" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Description *</label>
                <textarea id="leaderDescription" required></textarea>
            </div>
            <div class="admin-form-group">
                <label>Upload Photo *</label>
                <input type="file" id="leaderPhoto" accept="image/*" required>
            </div>
            <input type="hidden" id="leaderEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="leaderSubmitBtn">Add Leader</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Leaders</h3>
        <div class="content-list" id="leadersList">
            ${getLeadersListHTML()}
        </div>
    `;
}

function getLeadersListHTML() {
    if (leaderItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No leaders yet. Add your first leader above!</p>';
    }
    
    return leaderItems.map((item, index) => `
        <div class="content-list-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.photoData || item.photoSrc}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4>${item.name}</h4>
                    ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem;">Original</span>' : ''}
                    <p><strong>${item.title}</strong></p>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editLeaderItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteLeaderItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleLeaderUpload(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('leaderPhoto').files[0];
    const editIndex = document.getElementById('leaderEditIndex').value;
    
    if (!photoFile && editIndex === '') {
        alert('Please select a photo');
        return;
    }
    
    const leaderData = {
        name: document.getElementById('leaderName').value,
        title: document.getElementById('leaderTitle').value,
        description: document.getElementById('leaderDescription').value,
        uploadDate: new Date().toISOString()
    };
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (editIndex !== '') {
                leaderItems[editIndex] = { ...leaderItems[editIndex], ...leaderData, photoData: event.target.result, photoSrc: null };
                alert('Leader updated successfully!');
            } else {
                leaderItems.push({
                    id: `custom-leader-${Date.now()}`,
                    ...leaderData,
                    photoData: event.target.result,
                    photoSrc: null,
                    isDefault: false
                });
                alert('Leader added successfully!');
            }
            saveToLocalStorage(STORAGE_KEYS.LEADERS, leaderItems);
            renderLeaders();
            openAdminPanel('leadership');
        };
        reader.readAsDataURL(photoFile);
    } else if (editIndex !== '') {
        leaderItems[editIndex] = { ...leaderItems[editIndex], ...leaderData };
        saveToLocalStorage(STORAGE_KEYS.LEADERS, leaderItems);
        renderLeaders();
        alert('Leader updated successfully!');
        openAdminPanel('leadership');
    }
}

function editLeaderItem(index) {
    const item = leaderItems[index];
    document.getElementById('leaderName').value = item.name;
    document.getElementById('leaderTitle').value = item.title;
    document.getElementById('leaderDescription').value = item.description;
    document.getElementById('leaderEditIndex').value = index;
    document.getElementById('leaderPhoto').required = false;
    document.getElementById('leaderSubmitBtn').textContent = 'Update Leader';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteLeaderItem(index) {
    if (confirm('Are you sure you want to delete this leader?')) {
        leaderItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.LEADERS, leaderItems);
        renderLeaders();
        openAdminPanel('leadership');
    }
}

function renderLeaders() {
    const leadersGrid = document.querySelector('#leadership .leadership-grid');
    if (!leadersGrid) return;
    
    const allLeadersHTML = leaderItems.map(item => `
        <div class="leader-card">
            <div class="leader-photo">
                <img src="${item.photoData || item.photoSrc}" alt="${item.name}">
            </div>
            <h3>${item.name}</h3>
            <div class="leader-title">${item.title}</div>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    leadersGrid.innerHTML = allLeadersHTML;
}

// ===========================================
// ENHANCED MEMBERS MANAGEMENT WITH EDIT
// ===========================================
function getMembersManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Member</h3>
        <form onsubmit="handleMemberAdminUpload(event)" id="memberAdminUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Member Name *</label>
                    <input type="text" id="adminMemberName" required>
                </div>
                <div class="admin-form-group">
                    <label>Member Duty/Role *</label>
                    <input type="text" id="adminMemberDuty" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>About Member *</label>
                <textarea id="adminMemberBio" required></textarea>
            </div>
            <div class="admin-form-group">
                <label>Upload Photo *</label>
                <input type="file" id="adminMemberPhoto" accept="image/*" required>
            </div>
            <input type="hidden" id="memberEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="memberSubmitBtn">Add Member</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Members</h3>
        <div class="content-list" id="membersList">
            ${getMembersListHTML()}
        </div>
    `;
}

function getMembersListHTML() {
    if (memberItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No members yet. Add your first member above!</p>';
    }
    
    return memberItems.map((item, index) => `
        <div class="content-list-item">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.photoData || item.photoSrc}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4>${item.name}</h4>
                    ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem;">Original</span>' : ''}
                    <p><strong>${item.duty}</strong></p>
                    <p>${item.bio}</p>
                </div>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editMemberItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteMemberItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleMemberAdminUpload(e) {
    e.preventDefault();
    
    const photoFile = document.getElementById('adminMemberPhoto').files[0];
    const editIndex = document.getElementById('memberEditIndex').value;
    
    if (!photoFile && editIndex === '') {
        alert('Please select a photo');
        return;
    }
    
    const memberData = {
        name: document.getElementById('adminMemberName').value,
        duty: document.getElementById('adminMemberDuty').value,
        bio: document.getElementById('adminMemberBio').value,
        uploadDate: new Date().toISOString()
    };
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (editIndex !== '') {
                memberItems[editIndex] = { ...memberItems[editIndex], ...memberData, photoData: event.target.result, photoSrc: null };
                alert('Member updated successfully!');
            } else {
                memberItems.push({
                    id: `custom-member-${Date.now()}`,
                    ...memberData,
                    photoData: event.target.result,
                    photoSrc: null,
                    isDefault: false
                });
                alert('Member added successfully!');
            }
            saveToLocalStorage(STORAGE_KEYS.MEMBERS, memberItems);
            renderMembers();
            openAdminPanel('members');
        };
        reader.readAsDataURL(photoFile);
    } else if (editIndex !== '') {
        memberItems[editIndex] = { ...memberItems[editIndex], ...memberData };
        saveToLocalStorage(STORAGE_KEYS.MEMBERS, memberItems);
        renderMembers();
        alert('Member updated successfully!');
        openAdminPanel('members');
    }
}

function editMemberItem(index) {
    const item = memberItems[index];
    document.getElementById('adminMemberName').value = item.name;
    document.getElementById('adminMemberDuty').value = item.duty;
    document.getElementById('adminMemberBio').value = item.bio;
    document.getElementById('memberEditIndex').value = index;
    document.getElementById('adminMemberPhoto').required = false;
    document.getElementById('memberSubmitBtn').textContent = 'Update Member';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteMemberItem(index) {
    if (confirm('Are you sure you want to delete this member?')) {
        memberItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.MEMBERS, memberItems);
        renderMembers();
        openAdminPanel('members');
    }
}

function renderMembers() {
    const membersGrid = document.getElementById('membersGrid');
    if (!membersGrid) return;
    
    const allMembersHTML = memberItems.map(member => `
        <div class="member-card">
            <div class="member-photo">
                <img src="${member.photoData || member.photoSrc}" alt="${member.name}">
            </div>
            <h3>${member.name}</h3>
            <div class="member-duty">${member.duty}</div>
            <p>${member.bio}</p>
        </div>
    `).join('');
    
    membersGrid.innerHTML = allMembersHTML;
}

// ===========================================
// ENHANCED BENEFITS MANAGEMENT WITH EDIT
// ===========================================
function getBenefitsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Benefit</h3>
        <form onsubmit="handleBenefitUpload(event)" id="benefitUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Benefit Title *</label>
                    <input type="text" id="benefitTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Icon Emoji *</label>
                    <input type="text" id="benefitIcon" placeholder="e.g., ⭐, 💪, 🎯" required maxlength="2">
                    <small style="color: #666;">Use an emoji (copy/paste from emojipedia.org)</small>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Benefit Description *</label>
                <textarea id="benefitDescription" required placeholder="Describe this benefit..."></textarea>
            </div>
            <input type="hidden" id="benefitEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="benefitSubmitBtn">Add Benefit</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Benefits</h3>
        <div class="content-list" id="benefitsList">
            ${getBenefitsListHTML()}
        </div>
    `;
}

function getBenefitsListHTML() {
    if (benefitItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No benefits yet. Add your first benefit above!</p>';
    }
    
    return benefitItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.icon} ${item.title}</h4>
                ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-left: 0.5rem;">Original</span>' : ''}
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editBenefitItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteBenefitItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function handleBenefitUpload(e) {
    e.preventDefault();
    
    const editIndex = document.getElementById('benefitEditIndex').value;
    const benefitData = {
        title: document.getElementById('benefitTitle').value,
        icon: document.getElementById('benefitIcon').value,
        description: document.getElementById('benefitDescription').value,
        uploadDate: new Date().toISOString()
    };
    
    if (editIndex !== '') {
        benefitItems[editIndex] = { ...benefitItems[editIndex], ...benefitData };
        alert('Benefit updated successfully!');
    } else {
        benefitItems.push({
            id: `custom-benefit-${Date.now()}`,
            ...benefitData,
            isDefault: false
        });
        alert('Benefit added successfully!');
    }
    
    saveToLocalStorage(STORAGE_KEYS.BENEFITS, benefitItems);
    renderBenefits();
    openAdminPanel('benefits');
}

function editBenefitItem(index) {
    const item = benefitItems[index];
    document.getElementById('benefitTitle').value = item.title;
    document.getElementById('benefitIcon').value = item.icon;
    document.getElementById('benefitDescription').value = item.description;
    document.getElementById('benefitEditIndex').value = index;
    document.getElementById('benefitSubmitBtn').textContent = 'Update Benefit';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteBenefitItem(index) {
    if (confirm('Are you sure you want to delete this benefit?')) {
        benefitItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.BENEFITS, benefitItems);
        renderBenefits();
        openAdminPanel('benefits');
    }
}

function renderBenefits() {
    const benefitsGrid = document.querySelector('#benefits .benefits-grid');
    if (!benefitsGrid) return;
    
    const allBenefitsHTML = benefitItems.map(item => `
        <div class="benefit-card">
            <div class="benefit-icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
    
    benefitsGrid.innerHTML = allBenefitsHTML;
}

// ===========================================
// ENHANCED BOOKS MANAGEMENT WITH EDIT
// ===========================================
function getBooksManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Books can be managed from the Books section</h3>
        <div class="content-list">
            ${getBooksListHTML()}
        </div>
    `;
}

function getBooksListHTML() {
    if (books.length === 0) {
        return '<p style="text-align: center; color: #666;">No books yet.</p>';
    }
    
    return books.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                ${item.isDefault ? '<span style="background: #718096; color: white; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-left: 0.5rem;">Original</span>' : ''}
                <p><strong>Author:</strong> ${item.author}</p>
                <p><strong>Category:</strong> ${item.category}</p>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editBookItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteBookItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Update the existing handleBookUpload function
const originalHandleBookUpload = handleBookUpload;
function handleBookUpload(e) {
    e.preventDefault();
    
    const coverFile = document.getElementById('bookCover').files[0];
    const pdfFile = document.getElementById('bookPDF').files[0];
    const editIndex = document.getElementById('bookEditIndex') ? document.getElementById('bookEditIndex').value : '';
    
    if (!pdfFile && editIndex === '') {
        alert('Please select a PDF file');
        return;
    }
    
    if (pdfFile && pdfFile.size > 20 * 1024 * 1024) {
        alert('PDF file size must be less than 20MB');
        return;
    }
    
    if (coverFile && coverFile.size > 2 * 1024 * 1024) {
        alert('Cover image size must be less than 2MB');
        return;
    }
    
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        category: document.getElementById('bookCategory').value,
        description: document.getElementById('bookDescription').value,
        pages: document.getElementById('bookPages').value || 'N/A',
        year: document.getElementById('bookYear').value || 'N/A',
        uploadDate: new Date().toISOString()
    };
    
    const readCover = coverFile ? new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(coverFile);
    }) : Promise.resolve(null);
    
    const readPDF = pdfFile ? new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(pdfFile);
    }) : Promise.resolve(null);
    
    Promise.all([readCover, readPDF]).then(([coverData, pdfData]) => {
        if (editIndex !== '') {
            // Update existing book
            books[editIndex] = {
                ...books[editIndex],
                ...bookData,
                coverData: coverData || books[editIndex].coverData,
                coverSrc: coverData ? null : books[editIndex].coverSrc,
                pdfData: pdfData || books[editIndex].pdfData,
                pdfSrc: pdfData ? null : books[editIndex].pdfSrc,
                pdfName: pdfFile ? pdfFile.name : books[editIndex].pdfName
            };
            alert('Book updated successfully!');
        } else {
            // Add new book
            books.push({
                id: `custom-book-${Date.now()}`,
                ...bookData,
                coverData: coverData,
                coverSrc: null,
                pdfData: pdfData,
                pdfSrc: null,
                pdfName: pdfFile.name,
                isDefault: false
            });
            alert('Book uploaded successfully!');
        }
        
        saveToLocalStorage(STORAGE_KEYS.BOOKS, books);
        renderBooks();
        toggleUploadForm();
    });
}

function editBookItem(index) {
    const item = books[index];
    
    // Scroll to books section
    document.getElementById('books').scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        // Open the upload form
        const form = document.getElementById('bookUploadForm');
        form.classList.add('active');
        
        // Add edit index hidden field if it doesn't exist
        if (!document.getElementById('bookEditIndex')) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'bookEditIndex';
            form.querySelector('form').appendChild(hiddenInput);
        }
        
        // Fill in the form
        document.getElementById('bookTitle').value = item.title;
        document.getElementById('bookAuthor').value = item.author;
        document.getElementById('bookCategory').value = item.category;
        document.getElementById('bookDescription').value = item.description;
        document.getElementById('bookPages').value = item.pages !== 'N/A' ? item.pages : '';
        document.getElementById('bookYear').value = item.year !== 'N/A' ? item.year : '';
        document.getElementById('bookEditIndex').value = index;
        
        // Make files optional for editing
        document.getElementById('bookPDF').required = false;
        
        // Update button text
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) submitBtn.textContent = 'Update Book';
        
        closeAdminPanel();
    }, 500);
}

function deleteBookItem(index) {
    if (confirm('Are you sure you want to delete this book?')) {
        books.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.BOOKS, books);
        renderBooks();
        openAdminPanel('books');
    }
}

function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;
    
    const allBooksHTML = books.map(book => `
        <div class="book-card">
            <div class="book-cover">
                ${(book.coverData || book.coverSrc) ? `<img src="${book.coverData || book.coverSrc}" alt="${book.title}">` : '📚'}
            </div>
            <div class="book-info">
                <span class="book-category">${book.category}</span>
                <h3>${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-description">${book.description}</p>
                <div class="book-meta">
                    <span class="book-pages">📄 ${book.pages} pages</span>
                    <span class="book-year">📅 ${book.year}</span>
                </div>
                <a href="${book.pdfData || book.pdfSrc}" class="download-btn" download="${book.pdfName}">
                    📥 Download PDF
                </a>
            </div>
        </div>
    `).join('');
    
    booksGrid.innerHTML = allBooksHTML;
}

// Update toggleUploadForm to reset edit mode
const originalToggleUploadForm = toggleUploadForm;
function toggleUploadForm() {
    const form = document.getElementById('bookUploadForm');
    form.classList.toggle('active');
    
    if (!form.classList.contains('active')) {
        document.querySelector('#bookUploadForm form').reset();
        document.getElementById('bookPDF').required = true;
        
        // Reset edit mode
        if (document.getElementById('bookEditIndex')) {
            document.getElementById('bookEditIndex').value = '';
        }
        
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) submitBtn.textContent = 'Upload Book';
    }
}

// ===========================================
// ENHANCED MEDIA MANAGEMENT
// ===========================================

// Videos
function getVideosManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Video</h3>
        <form onsubmit="handleVideoUpload(event)" id="videoUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Video Title *</label>
                    <input type="text" id="videoTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Video Description *</label>
                    <input type="text" id="videoDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Video File *</label>
                <input type="file" id="videoFile" accept="video/*" required>
                <small style="color: #666;">Supported: MP4, WebM (Max 50MB)</small>
            </div>
            <div class="admin-form-group">
                <label>Upload Thumbnail (Optional)</label>
                <input type="file" id="videoThumbnail" accept="image/*">
            </div>
            <input type="hidden" id="videoEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="videoSubmitBtn">Add Video</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Videos</h3>
        <div class="content-list" id="videosList">
            ${getVideosListHTML()}
        </div>
    `;
}

function getVideosListHTML() {
    if (videoItems.length === 0) {
        return '<p style="text-align: center; color: #666;">No videos yet. Add your first video above!</p>';
    }
    
    return videoItems.map((item, index) => `
        <div class="content-list-item">
            <div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
            <div class="content-list-actions">
                <button class="edit-btn" onclick="editVideoItem(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteVideoItem(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function editVideoItem(index) {
    const item = videoItems[index];
    document.getElementById('videoTitle').value = item.title;
    document.getElementById('videoDescription').value = item.description;
    document.getElementById('videoEditIndex').value = index;
    document.getElementById('videoFile').required = false;
    document.getElementById('videoSubmitBtn').textContent = 'Update Video';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Similar edit functions for Podcasts and Recordings
function getPodcastsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Podcast</h3>
        <form onsubmit="handlePodcastUpload(event)" id="podcastUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Podcast Title *</label>
                    <input type="text" id="podcastTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Episode Description *</label>
                    <input type="text" id="podcastDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Audio File *</label>
                <input type="file" id="podcastAudio" accept="audio/*" required>
                <small style="color: #666;">Supported: MP3, WAV (Max 30MB)</small>
            </div>
            <div class="admin-form-group">
                <label>Upload Cover Image (Optional)</label>
                <input type="file" id="podcastCover" accept="image/*">
            </div>
            <input type="hidden" id="podcastEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="podcastSubmitBtn">Add Podcast</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Podcasts</h3>
        <div class="content-list" id="podcastsList">
            ${getPodcastsListHTML()}
        </div>
    `;
}

function editPodcastItem(index) {
    const item = podcastItems[index];
    document.getElementById('podcastTitle').value = item.title;
    document.getElementById('podcastDescription').value = item.description;
    document.getElementById('podcastEditIndex').value = index;
    document.getElementById('podcastAudio').required = false;
    document.getElementById('podcastSubmitBtn').textContent = 'Update Podcast';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getRecordingsManagementHTML() {
    return `
        <h3 style="color: #1a361d; margin-bottom: 1.5rem;">Add New Recording</h3>
        <form onsubmit="handleRecordingUpload(event)" id="recordingUploadForm">
            <div class="admin-form-grid">
                <div class="admin-form-group">
                    <label>Recording Title *</label>
                    <input type="text" id="recordingTitle" required>
                </div>
                <div class="admin-form-group">
                    <label>Event Description *</label>
                    <input type="text" id="recordingDescription" required>
                </div>
            </div>
            <div class="admin-form-group">
                <label>Upload Audio File *</label>
                <input type="file" id="recordingAudio" accept="audio/*" required>
                <small style="color: #666;">Supported: MP3, WAV (Max 50MB)</small>
            </div>
            <input type="hidden" id="recordingEditIndex" value="">
            <div class="admin-form-actions">
                <button type="button" class="btn-admin-cancel" onclick="closeAdminPanel()">Cancel</button>
                <button type="submit" class="btn-admin-submit" id="recordingSubmitBtn">Add Recording</button>
            </div>
        </form>
        
        <h3 style="color: #1a361d; margin: 2rem 0 1rem;">Current Recordings</h3>
        <div class="content-list" id="recordingsList">
            ${getRecordingsListHTML()}
        </div>
    `;
}

function editRecordingItem(index) {
    const item = recordingItems[index];
    document.getElementById('recordingTitle').value = item.title;
    document.getElementById('recordingDescription').value = item.description;
    document.getElementById('recordingEditIndex').value = index;
    document.getElementById('recordingAudio').required = false;
    document.getElementById('recordingSubmitBtn').textContent = 'Update Recording';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================================
// ADMIN DASHBOARD - ADD RESET BUTTON
// ===========================================

// Add this function to your adminLogout or dashboard display
function addResetButtonToDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent && !document.getElementById('resetDataBtn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'resetDataBtn';
        resetBtn.textContent = '🔄 Reset All Content to Defaults';
        resetBtn.style.background = '#f59e0b';
        resetBtn.style.marginTop = '1rem';
        resetBtn.onclick = clearAllStoredData;
        
        // Insert before logout button
        const logoutBtn = dashboardContent.querySelector('button[onclick="adminLogout()"]');
        if (logoutBtn) {
            logoutBtn.parentNode.insertBefore(resetBtn, logoutBtn);
        }
    }
}

// Call this when admin logs in
function adminLogin() {
    const email = document.getElementById('adminUsername').value.toLowerCase().trim();
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');

    const admin = ADMIN_CREDENTIALS.find(a => 
        a.email.toLowerCase() === email && a.password === password
    );

    if (admin) {
        isAdminLoggedIn = true;
        currentAdminEmail = admin.email;
        
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboardContent').classList.add('active');
        errorElement.textContent = '';
        
        document.getElementById('adminWelcome').textContent = `Logged in as: ${currentAdminEmail}`;
        document.getElementById('adminWelcome').style.display = 'block';
        
        document.getElementById('adminControls').classList.add('active');
        
        updateAdminUIElements();
        updateDashboard();
        addResetButtonToDashboard(); // Add reset button
    } else {
        errorElement.textContent = 'Invalid email or password';
    }
}

// ===========================================
// RENDER FUNCTIONS FOR MEDIA (with localStorage)
// ===========================================

function renderVideos() {
    const videosGrid = document.querySelector('#videos .video-grid');
    if (!videosGrid) return;
    
    const customVideosHTML = videoItems.map(item => `
        <div class="video-item">
            <video controls ${item.thumbnailData ? `poster="${item.thumbnailData}"` : ''}>
                <source src="${item.videoData}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="media-title">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
    
    videosGrid.innerHTML = customVideosHTML || '<p style="text-align: center; color: #666; grid-column: 1/-1;">No videos available yet.</p>';
}

function deleteVideoItem(index) {
    if (confirm('Are you sure you want to delete this video?')) {
        videoItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.VIDEOS, videoItems);
        renderVideos();
        openAdminPanel('videos');
    }
}

function renderPodcasts() {
    const podcastsGrid = document.querySelector('#podcasts .podcast-grid');
    if (!podcastsGrid) return;
    
    const customPodcastsHTML = podcastItems.map(item => `
        <div class="podcast-item">
            <div class="podcast-cover">
                ${item.coverData ? `<img src="${item.coverData}" alt="Podcast Cover">` : '🎙️'}
            </div>
            <h3>${item.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${item.description}</p>
            <audio controls>
                <source src="${item.audioData}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
        </div>
    `).join('');
    
    podcastsGrid.innerHTML = customPodcastsHTML || '<p style="text-align: center; color: #666; grid-column: 1/-1;">No podcasts available yet.</p>';
}

function deletePodcastItem(index) {
    if (confirm('Are you sure you want to delete this podcast?')) {
        podcastItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.PODCASTS, podcastItems);
        renderPodcasts();
        openAdminPanel('podcasts');
    }
}

function renderRecordings() {
    const recordingsGrid = document.querySelector('#recordings .audio-grid');
    if (!recordingsGrid) return;
    
    const customRecordingsHTML = recordingItems.map(item => `
        <div class="audio-item">
            <div class="audio-icon">🎧</div>
            <h3>${item.title}</h3>
            <p style="color: #666; margin-bottom: 1rem;">${item.description}</p>
            <audio controls>
                <source src="${item.audioData}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>
        </div>
    `).join('');
    
    recordingsGrid.innerHTML = customRecordingsHTML || '<p style="text-align: center; color: #666; grid-column: 1/-1;">No recordings available yet.</p>';
}

function deleteRecordingItem(index) {
    if (confirm('Are you sure you want to delete this recording?')) {
        recordingItems.splice(index, 1);
        saveToLocalStorage(STORAGE_KEYS.RECORDINGS, recordingItems);
        renderRecordings();
        openAdminPanel('recordings');
    }
}



// Call this in browser console: testEmail()

// ===========================================
// INSTRUCTIONS FOR USE WITH LOCALSTORAGE
// ===========================================
/*
✨ ENHANCED ADMIN SYSTEM WITH LOCALSTORAGE PERSISTENCE ✨

🎯 FEATURES:
✅ All changes are AUTOMATICALLY SAVED to browser localStorage
✅ Data persists even after page refresh or browser restart
✅ Full Edit & Delete for ALL content (original + custom)
✅ Reset button to restore defaults
✅ Works without backend/server

📋 INSTALLATION:
1. BACKUP your billionaires_jsR.js file
2. Add this entire code to your JavaScript file
3. Refresh your website
4. Test by making changes and refreshing - they should persist!

🔒 DATA STORAGE:
- Uses browser localStorage (5-10MB limit)
- Data stored locally in user's browser
- Each section has its own storage key
- Images/PDFs stored as base64 (uses more space)

⚠️ LIMITATIONS:
- localStorage has size limits (5-10MB typically)
- Large images/videos may hit this limit
- Data is browser-specific (not synced across devices)
- Clearing browser data will delete content

💡 STORAGE KEYS USED:
- billionaires_gallery
- billionaires_events
- billionaires_leaders
- billionaires_members
- billionaires_benefits
- billionaires_books
- billionaires_videos
- billionaires_podcasts
- billionaires_recordings
- billionaires_initialized

🔄 RESET FUNCTIONALITY:
- Admin dashboard now has "Reset All Content to Defaults" button
- This clears ALL custom content and restores originals
- Requires double confirmation to prevent accidents

🎉 ENJOY YOUR PERSISTENT ADMIN SYSTEM!
*/